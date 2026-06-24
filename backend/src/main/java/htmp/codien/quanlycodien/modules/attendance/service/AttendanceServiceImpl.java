package htmp.codien.quanlycodien.modules.attendance.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import htmp.codien.quanlycodien.modules.attendance.dto.AttendanceLogDTO;
import htmp.codien.quanlycodien.modules.attendance.dto.AttendanceResponse;
import htmp.codien.quanlycodien.modules.attendance.dto.CurrentWorkingEmployeeDTO;
import htmp.codien.quanlycodien.modules.attendance.entity.Attendance;
import htmp.codien.quanlycodien.modules.attendance.entity.AttendanceLog;
import htmp.codien.quanlycodien.modules.attendance.enums.AttendanceStatus;
import htmp.codien.quanlycodien.modules.attendance.helper.AttendanceHelper;
import htmp.codien.quanlycodien.modules.attendance.helper.AttendanceHelper.CheckinCheckout;
import htmp.codien.quanlycodien.modules.attendance.helper.AttendanceHelper.ShiftInfo;
import htmp.codien.quanlycodien.modules.attendance.repository.AttendanceLogRepository;
import htmp.codien.quanlycodien.modules.attendance.repository.AttendanceRepository;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.enums.EmployeeStatus;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.workschedule.entity.Shift;
import htmp.codien.quanlycodien.modules.workschedule.entity.WorkSchedule;
import htmp.codien.quanlycodien.modules.workschedule.repository.WorkScheduleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceLogRepository attendanceLogRepository;
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final AttendanceHelper helper;
    private final WorkScheduleRepository workScheduleRepository;
    private final AtomicBoolean fetchFromWindowsInProgress = new AtomicBoolean(false);
    private volatile String fetchFromWindowsLastResult = "Chưa có lần lấy dữ liệu nào";
    private volatile LocalDateTime fetchFromWindowsLastUpdatedAt;

    private final AtomicBoolean attendanceSyncInProgress = new AtomicBoolean(false);
    private volatile String attendanceSyncLastResult = "Chưa có lần đồng bộ nào";
    private volatile LocalDateTime attendanceSyncLastUpdatedAt;

    @Value("${WINDOW_SERVER}")
    private String windowsServiceUrl;

    public String processAttendanceRangeAsync(LocalDate startDate, LocalDate endDate, Long employeeId) {
        if (!attendanceSyncInProgress.compareAndSet(false, true)) {
            return "Đồng bộ đang chạy. Kết quả gần nhất (" +
                    (attendanceSyncLastUpdatedAt != null ? attendanceSyncLastUpdatedAt : "N/A") +
                    "): " + attendanceSyncLastResult;
        }

        CompletableFuture.runAsync(() -> {
            try {
                long startTime = System.currentTimeMillis();
                log.info("========== ASYNC ATTENDANCE SYNC START ==========");
                log.info("Range: {} to {} | Employee: {}", startDate, endDate,
                        employeeId != null ? employeeId : "ALL");

                int daysProcessed = 0;
                for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
                    try {
                        processDailyAttendance(date, employeeId);
                        daysProcessed++;

                        if (daysProcessed % 5 == 0) {
                            log.info("Progress: {}/{} days completed", daysProcessed,
                                    java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1);
                        }
                    } catch (Exception ex) {
                        log.error("Error processing date {}: {}", date, ex.getMessage());
                    }
                }

                long duration = System.currentTimeMillis() - startTime;
                attendanceSyncLastResult = String.format(
                        "Hoàn tất %d ngày trong %.2fs (%.2fs/ngày)",
                        daysProcessed, duration / 1000.0, (duration / 1000.0) / daysProcessed);
                log.info("========== ASYNC ATTENDANCE SYNC COMPLETED ==========");
                log.info(attendanceSyncLastResult);
            } catch (Exception ex) {
                attendanceSyncLastResult = "Lỗi: " + ex.getMessage();
                log.error("Async attendance sync failed", ex);
            } finally {
                attendanceSyncLastUpdatedAt = LocalDateTime.now();
                attendanceSyncInProgress.set(false);
            }
        });

        return "Đã gửi yêu cầu đồng bộ từ " + startDate + " đến " + endDate +
                ". Hệ thống đang xử lý nền, vui lòng kiểm tra status sau.";
    }

    public String getAttendanceSyncStatus() {
        if (attendanceSyncInProgress.get()) {
            return "Đang đồng bộ dữ liệu chấm công...";
        }

        String updatedAtText = attendanceSyncLastUpdatedAt != null
                ? attendanceSyncLastUpdatedAt.toString()
                : "N/A";

        return "Rảnh. Kết quả gần nhất (" + updatedAtText + "): " + attendanceSyncLastResult;
    }

    @Override
    public void processDailyAttendance(LocalDate workDate, Long employeeId) {
        LocalDateTime startOfDay = workDate.atStartOfDay();
        LocalDateTime endOfDay = workDate.atTime(LocalTime.MAX);

        List<Long> employeeIds;

        if (employeeId != null) {
            employeeIds = List.of(employeeId);
        } else {
            employeeIds = attendanceLogRepository.findDistinctActiveEmployeeIdsByDate(startOfDay, endOfDay);
        }

        if (employeeIds.isEmpty()) {
            return;
        }

        for (Long empId : employeeIds) {
            try {
                processAttendanceForEmployee(empId, workDate);
            } catch (Exception ex) {
            }
        }
    }

    @Transactional
    @Override
    public void processAttendanceForEmployee(Long employeeId, LocalDate workDate) {
        ShiftInfo shiftInfo = helper.getShiftInfo(employeeId, workDate);

        if (shiftInfo.name() != null &&
                List.of("NT", "DLBT", "L", "P", "NS", "NKL", "NPL").contains(shiftInfo.name().toUpperCase())) {
            return;
        }

        LocalDateTime startQuery = shiftInfo.isOvernightShift()
                ? shiftInfo.start()
                : workDate.atStartOfDay();
        LocalDateTime endQuery = shiftInfo.isOvernightShift()
                ? shiftInfo.end()
                : workDate.atTime(LocalTime.MAX);

        List<AttendanceLog> logs = attendanceLogRepository.findByEmployeeIdAndLogTimeBetween(
                employeeId, startQuery, endQuery);

        List<LocalDateTime> filteredLogs = helper.getFilteredLogs(logs);

        CheckinCheckout cc = helper.determineCheckinCheckout(filteredLogs, shiftInfo);

        LocalDate targetWorkDate = (shiftInfo.isOvernightShift() && shiftInfo.start() != null)
                ? shiftInfo.start().plusHours(1).toLocalDate()
                : workDate;

        Attendance attendance = helper.getOrCreateAttendance(employeeId, targetWorkDate);

        if (shiftInfo.shiftId() != null) {
            Shift shift = new Shift();
            shift.setId(shiftInfo.shiftId());
            attendance.setShift(shift);
        }

        attendance.setCheckinTime(cc.checkin());
        attendance.setCheckoutTime(cc.checkout());
        attendance.setStatus(shiftInfo.shiftId() == null
                ? AttendanceStatus.UNASSIGNED
                : AttendanceStatus.NORMAL);

        attendanceRepository.save(attendance);
    }

    public AttendanceResponse fetchDailyAttendanceDataByEmployeeId(LocalDate workDate, Long employeeId) {
        AttendanceResponse response = new AttendanceResponse();

        Attendance attendance = attendanceRepository.findByEmployeeIdAndWorkDate(employeeId, workDate)
                .orElse(null);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + employeeId));

        WorkSchedule workSchedule = workScheduleRepository.findByEmployeeIdAndWorkDate(employeeId, workDate)
                .orElse(null);

        if (attendance == null) {

            response.setEmployeeId(employeeId);
            response.setEmployeeName(employee.getName());
            response.setEmployeeCode(employee.getCode());
            response.setWorkDate(workDate);
            response.setShiftName(workSchedule != null ? workSchedule.getShift().getShiftCode() : "N/A");
            response.setLateMinutes(0);
            response.setEarlyLeaveMinutes(0);
            response.setOverTimeHours(0.0);
            return response;
        }

        Shift shift = attendance.getShift();
        LocalDateTime shiftStart, shiftEnd;

        if (shift == null || shift.getStartTime() == null || shift.getEndTime() == null) {
            response.setEmployeeId(employeeId);
            response.setEmployeeName(attendance.getEmployee().getName());
            response.setEmployeeCode(attendance.getEmployee().getCode());
            response.setWorkDate(workDate);
            response.setShiftName(workSchedule != null ? workSchedule.getShift().getShiftCode() : "N/A");
            response.setCheckInTime(attendance.getCheckinTime());
            response.setCheckOutTime(attendance.getCheckoutTime());
            response.setLateMinutes(0);
            response.setEarlyLeaveMinutes(0);
            response.setOverTimeHours(0.0);
            return response;
        } else {
            shiftStart = LocalDateTime.of(workDate, shift.getStartTime());
            shiftEnd = LocalDateTime.of(workDate, shift.getEndTime());

            if (shift.getEndTime().isBefore(shift.getStartTime())) {
                shiftEnd = shiftEnd.plusDays(1);
            }
        }

        String shiftCode = shift.getShiftCode();
        List<String> otShifts = Arrays.asList(
                "HC150", "HC200", "KO150", "KD150", "KO200", "KD200", "XL", "XL1", "HCL", "PL");

        if (otShifts.contains(shiftCode)) {
            if (attendance.getCheckinTime() != null && attendance.getCheckoutTime() != null) {
                long minutes = Duration.between(attendance.getCheckinTime(), attendance.getCheckoutTime()).toMinutes();
                double overtimeHours = Math.floor(minutes / 30.0) * 0.5;
                response.setOverTimeHours(overtimeHours);
            } else {
                response.setOverTimeHours(0.0);
            }

            response.setLateMinutes(0);
            response.setEarlyLeaveMinutes(0);
        } else {

            if (attendance.getCheckinTime() != null) {
                LocalDateTime checkin = attendance.getCheckinTime();
                LocalDateTime lateThreshold = shiftStart.minusMinutes(4);

                if (checkin.isAfter(lateThreshold) && checkin.isBefore(shiftStart.plusMinutes(1))) {
                    response.setLateMinutes(5);
                } else if (checkin.isAfter(shiftStart)) {
                    long minutesLate = Duration.between(shiftStart, checkin).toMinutes();
                    long blocks = (long) Math.ceil(minutesLate / 30.0);
                    response.setLateMinutes((int) (blocks * 30));
                }
            }

            int totalOvertimeMinutes = 0;
            LocalDateTime checkin = attendance.getCheckinTime();
            LocalDateTime checkout = attendance.getCheckoutTime();

            if (checkin != null && checkin.isBefore(shiftStart)) {
                long minutesBefore = Duration.between(checkin, shiftStart).toMinutes();
                if (minutesBefore >= 60) {
                    if (minutesBefore < 120) {
                        totalOvertimeMinutes += 60;
                    } else {
                        long blocks = (long) Math.floor((minutesBefore - 60) / 30.0);
                        totalOvertimeMinutes += 60 + (blocks * 30);
                    }
                }
            }

            if (checkout != null) {
                if (checkout.isBefore(shiftEnd.plusMinutes(5))) {
                    long minutesEarly = Duration.between(checkout, shiftEnd).toMinutes();
                    if (minutesEarly > 0) {
                        if (minutesEarly <= 60) {
                            response.setEarlyLeaveMinutes(60);
                        } else {
                            long blocks = (long) Math.ceil((minutesEarly - 60) / 30.0);
                            response.setEarlyLeaveMinutes((int) (60 + blocks * 30));
                        }
                    }
                } else {
                    long minutesOver = Duration.between(shiftEnd, checkout).toMinutes();
                    if (minutesOver >= 60) {
                        if (minutesOver < 120) {
                            totalOvertimeMinutes += 60;
                        } else {
                            long blocks = (long) Math.floor((minutesOver - 60) / 30.0);
                            totalOvertimeMinutes += 60 + (blocks * 30);
                        }
                    }
                }
            }

            double overtimeHours = Math.floor(totalOvertimeMinutes / 30.0) * 0.5;
            response.setOverTimeHours(overtimeHours);
        }

        response.setEmployeeId(employeeId);
        response.setEmployeeName(attendance.getEmployee().getName());
        response.setEmployeeCode(attendance.getEmployee().getCode());
        response.setWorkDate(workDate);
        response.setCheckInTime(attendance.getCheckinTime());
        response.setCheckOutTime(attendance.getCheckoutTime());
        response.setShiftName(
                shiftCode != null ? shiftCode : workSchedule != null ? workSchedule.getShift().getShiftCode() : "N/A");

        return response;
    }

    @Override
    public List<AttendanceResponse> getAttendanceDataByDepartmentId(LocalDate workDate, Long departmentId) {

        List<Employee> employeeList = employeeRepository.findByDepartment_IdAndStatusIn(departmentId,
                List.of(EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION));

        List<AttendanceResponse> attendanceResponses = new ArrayList<>();

        for (Employee employee : employeeList) {
            AttendanceResponse response = fetchDailyAttendanceDataByEmployeeId(workDate, employee.getId());
            attendanceResponses.add(response);
        }

        return attendanceResponses;
    }

    @Override
    public String triggerFetchFromWindowsService() {
        try {
            String result = restTemplate.postForObject(windowsServiceUrl + "/fetch", createWindowsFetchRequestBody(),
                    String.class);
            fetchFromWindowsLastResult = result != null ? result : "Fetch hoàn tất";
            fetchFromWindowsLastUpdatedAt = LocalDateTime.now();
            return fetchFromWindowsLastResult;
        } catch (Exception ex) {
            fetchFromWindowsLastResult = "Không thể gọi Windows service: " + ex.getMessage();
            fetchFromWindowsLastUpdatedAt = LocalDateTime.now();
            return fetchFromWindowsLastResult;
        }
    }

    @Override
    public String startFetchFromWindowsServiceInBackground() {
        if (!fetchFromWindowsInProgress.compareAndSet(false, true)) {
            return "Tiến trình lấy dữ liệu đang chạy, vui lòng chờ hoàn tất";
        }

        CompletableFuture.runAsync(() -> {
            try {

                String result = restTemplate.postForObject(windowsServiceUrl + "/fetch",
                        createWindowsFetchRequestBody(),
                        String.class);
                fetchFromWindowsLastResult = result != null ? result : "Fetch hoàn tất";
                log.info("Fetch attendance logs completed: {}", fetchFromWindowsLastResult);
            } catch (Exception ex) {
                fetchFromWindowsLastResult = "Không thể gọi Windows service: " + ex.getMessage();
                log.error("Fetch attendance logs failed", ex);
            } finally {
                fetchFromWindowsLastUpdatedAt = LocalDateTime.now();
                fetchFromWindowsInProgress.set(false);
            }
        });

        return "Đã gửi yêu cầu lấy dữ liệu, hệ thống đang xử lý nền";
    }

    private Map<String, Object> createWindowsFetchRequestBody() {
        Map<String, Object> db = new HashMap<>();
        db.put("server", "apps.htmp.vn");
        db.put("port", 3306);
        db.put("userId", "dunghq");
        db.put("password", "Htmp**88");
        db.put("database", "codien");
        db.put("sslMode", "None");

        List<Map<String, Object>> devices = new ArrayList<>();
        Map<String, Object> device1 = new HashMap<>();
        device1.put("ip", "10.0.1.254");
        device1.put("port", 4370);
        device1.put("machineNumber", 1);
        devices.add(device1);

        Map<String, Object> device2 = new HashMap<>();
        device2.put("ip", "10.0.1.253");
        device2.put("port", 4370);
        device2.put("machineNumber", 1);
        devices.add(device2);

        Map<String, Object> device3 = new HashMap<>();
        device3.put("ip", "10.0.1.96");
        device3.put("port", 4370);
        device3.put("machineNumber", 1);
        devices.add(device3);

        Map<String, Object> device4 = new HashMap<>();
        device4.put("ip", "10.0.1.97");
        device4.put("port", 4370);
        device4.put("machineNumber", 1);
        devices.add(device4);

        Map<String, Object> body = new HashMap<>();
        body.put("db", db);
        body.put("devices", devices);
        return body;
    }

    @Override
    public String getFetchFromWindowsJobStatus() {
        if (fetchFromWindowsInProgress.get()) {
            return "Đang lấy dữ liệu từ máy chấm công...";
        }

        String updatedAtText = fetchFromWindowsLastUpdatedAt != null
                ? fetchFromWindowsLastUpdatedAt.toString()
                : "N/A";

        return "Rảnh. Kết quả gần nhất (" + updatedAtText + "): " + fetchFromWindowsLastResult;
    }

    @Override
    public String getWindowsServiceStatus() {
        try {
            return restTemplate.getForObject(windowsServiceUrl + "/status", String.class);
        } catch (Exception ex) {
            return "Không thể gọi Windows service: " + ex.getMessage();
        }
    }

    @Override
    public List<CurrentWorkingEmployeeDTO> getCurrentlyWorkingEmployees(LocalDate workDate) {
        return attendanceRepository.findCurrentlyWorkingEmployees(workDate);
    }

    @Override
    public Page<AttendanceLogDTO> getRawAttendanceLogs(Long employeeId, LocalDate startDate, LocalDate endDate,
            int page,
            int size) {
        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(LocalTime.MAX) : null;

        Pageable pageable = PageRequest.of(page, size);
        Page<AttendanceLog> logsPage = attendanceLogRepository.findRawLogsWithFilters(
                employeeId,
                startDateTime,
                endDateTime,
                pageable);

        return logsPage.map(log -> {
            AttendanceLogDTO dto = AttendanceLogDTO.builder()
                    .id(log.getId())
                    .deviceIp(log.getDeviceIp())
                    .machineEmployeeId(log.getMachineEmployeeId())
                    .logTime(log.getLogTime())
                    .build();

            if (log.getMachineEmployeeId() != null) {
                employeeRepository.findByMachineEmployeeId(log.getMachineEmployeeId())
                        .ifPresent(emp -> {
                            dto.setEmployeeCode(emp.getCode());
                            dto.setEmployeeName(emp.getName());
                            if (emp.getDepartment() != null) {
                                dto.setDepartmentName(emp.getDepartment().getName());
                            }
                        });
            }

            return dto;
        });
    }
}