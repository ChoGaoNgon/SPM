package htmp.codien.quanlycodien.modules.workreport.service;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.infrastructure.storage.FileStorageService;
import htmp.codien.quanlycodien.modules.attendance.entity.Attendance;
import htmp.codien.quanlycodien.modules.attendance.repository.AttendanceRepository;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.workreport.dto.DailyWorkReportDTO;
import htmp.codien.quanlycodien.modules.workreport.dto.DailyWorkReportItemDTO;
import htmp.codien.quanlycodien.modules.workreport.dto.EmployeeWorkReportDTO;
import htmp.codien.quanlycodien.modules.workreport.entity.DailyWorkReport;
import htmp.codien.quanlycodien.modules.workreport.helper.WorkTimeCalculator;
import htmp.codien.quanlycodien.modules.workreport.repository.DailyWorkReportRepository;
import htmp.codien.quanlycodien.modules.workschedule.entity.Shift;
import htmp.codien.quanlycodien.modules.workschedule.entity.ShiftBreak;
import htmp.codien.quanlycodien.modules.workschedule.repository.ShiftBreakRepository;
import htmp.codien.quanlycodien.modules.workschedule.repository.WorkScheduleRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DailyWorkReportServiceImpl implements DailyWorkReportService {

    private final DailyWorkReportRepository reportRepository;
    private final EmployeeRepository employeeRepository;
    private final FileStorageService fileStorageService;
    private final WorkScheduleRepository workScheduleRepository;
    private final ShiftBreakRepository shiftBreakRepository;
    private final AttendanceRepository attendanceRepository;

    @Override
    public List<DailyWorkReportDTO> getAllReports() {
        return reportRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private DailyWorkReportDTO toDTO(DailyWorkReport report) {
        Employee emp = report.getEmployee();
        return DailyWorkReportDTO.builder()
                .id(report.getId())
                .taskDescription(report.getTaskDescription())
                .startDateTime(report.getStartDateTime())
                .endDateTime(report.getEndDateTime())
                .filePath(report.getFilePath())
                .employeeId(emp != null ? emp.getId() : null)
                .employeeCode(emp != null ? emp.getCode() : null)
                .employeeName(emp != null ? emp.getName() : null)
                .build();
    }

    private DailyWorkReportItemDTO toItemDTO(DailyWorkReport report) {
        return DailyWorkReportItemDTO.builder()
                .id(report.getId())
                .taskDescription(report.getTaskDescription())
                .startDateTime(report.getStartDateTime())
                .endDateTime(report.getEndDateTime())
                .filePath(report.getFilePath())
                .createdAt(report.getCreatedAt())
                .build();
    }

    private record TimeRange(
            LocalDateTime startDateTime,
            LocalDateTime endDateTime,
            String shiftCode,
            Long shiftId,
            LocalDateTime plannedStart,
            LocalDateTime plannedEnd,
            LocalDateTime checkinTime,
            LocalDateTime checkoutTime) {
    }

    private TimeRange resolveWorkTime(Employee emp, LocalDate date, List<Object[]> shiftTimes) {
        Attendance attendance = attendanceRepository.findByEmployeeIdAndWorkDate(emp.getId(), date).orElse(null);
        Shift shift = attendance != null ? attendance.getShift() : null;

        LocalDateTime plannedStart;
        LocalDateTime plannedEnd;
        String shiftCode = "";
        Long shiftId = 0L;

        if (shiftTimes != null && !shiftTimes.isEmpty()) {
            Object[] s = shiftTimes.get(0);
            LocalTime shiftStart = s[0] != null ? ((java.sql.Time) s[0]).toLocalTime() : LocalTime.MIN;
            LocalTime shiftEnd = s[1] != null ? ((java.sql.Time) s[1]).toLocalTime() : LocalTime.MAX;
            shiftId = s[2] != null ? (Long) s[2] : 0L;
            shiftCode = s[3] != null ? (String) s[3] : "";

            plannedStart = LocalDateTime.of(date, shiftStart);
            plannedEnd = LocalDateTime.of(date, shiftEnd);
            if (shiftEnd.isBefore(shiftStart)) {
                plannedEnd = plannedEnd.plusDays(1);
            }
        } else {
            plannedStart = LocalDateTime.of(date, LocalTime.MIN);
            plannedEnd = LocalDateTime.of(date, LocalTime.MAX);
        }

        LocalDateTime checkin = attendance != null ? attendance.getCheckinTime() : null;
        LocalDateTime checkout = attendance != null ? attendance.getCheckoutTime() : null;

        if (checkin == null && checkout == null) {
            return new TimeRange(
                    plannedStart,
                    plannedStart,
                    shiftCode,
                    shiftId,
                    plannedStart,
                    plannedEnd,
                    null,
                    null);
        }

        if (checkin == null) {
            checkin = plannedStart;
        }

        if (checkout == null) {
            checkout = plannedEnd;
        }

        LocalDateTime startDateTime = checkin.isAfter(plannedStart) ? checkin : plannedStart;
        LocalDateTime endDateTime = checkout.isBefore(plannedEnd) ? checkout : plannedEnd;

        if (!endDateTime.isAfter(startDateTime)) {
            if (!checkout.isAfter(plannedStart)) {
                startDateTime = plannedStart;
                endDateTime = plannedStart;
            } else {
                startDateTime = plannedEnd;
                endDateTime = plannedEnd;
            }
        }

        if (shift != null) {
            shiftId = shift.getId();
            shiftCode = shift.getShiftCode();
        }

        return new TimeRange(startDateTime, endDateTime, shiftCode, shiftId,
                plannedStart, plannedEnd, checkin, checkout);
    }

    private List<DailyWorkReportItemDTO> mapReportsToItems(List<DailyWorkReport> reports) {
        return reports.stream().map(this::toItemDTO).toList();
    }

    private double calculateEfficiency(List<DailyWorkReportItemDTO> items, long plannedMinutes,
            List<ShiftBreak> breaks) {

        int totalBreakMinutes = breaks.stream().mapToInt(ShiftBreak::getDuration).sum();

        List<WorkTimeCalculator.Interval> mappedBreaks = new ArrayList<>();
        for (DailyWorkReportItemDTO item : items) {
            LocalDateTime workStart = item.getStartDateTime();
            LocalDateTime workEnd = item.getEndDateTime();
            LocalDate workDate = workStart.toLocalDate();

            for (ShiftBreak br : breaks) {
                LocalDateTime breakStart = LocalDateTime.of(workDate, br.getStartTime());
                LocalDateTime breakEnd = LocalDateTime.of(workDate, br.getEndTime());
                if (breakEnd.isBefore(breakStart)) {
                    breakEnd = breakEnd.plusDays(1);
                }
                if (!breakEnd.isBefore(workStart) && !breakStart.isAfter(workEnd)) {
                    mappedBreaks.add(new WorkTimeCalculator.Interval(breakStart, breakEnd));
                }
            }
        }

        long actualMinutes = WorkTimeCalculator.calculateTotalMinutes(
                items,
                DailyWorkReportItemDTO::getStartDateTime,
                DailyWorkReportItemDTO::getEndDateTime,
                mappedBreaks);

        long effectivePlannedMinutes = Math.max(0, plannedMinutes - totalBreakMinutes);

        return effectivePlannedMinutes > 0 ? (double) actualMinutes / effectivePlannedMinutes * 100 : 0;
    }

    private EmployeeWorkReportDTO buildEmployeeWorkReport(Employee emp, LocalDate date) {
        List<Object[]> shiftTimes = workScheduleRepository.findShiftTimesByEmployeeAndDate(emp.getId(), date);

        if (shiftTimes == null || shiftTimes.isEmpty()) {
            return null;
        }

        TimeRange range = resolveWorkTime(emp, date, shiftTimes);

        List<DailyWorkReport> reports = reportRepository.findReportsByEmployeeAndTimeRange(
                emp.getId(),
                range.checkinTime(),
                range.checkoutTime());

        if (reports.isEmpty()) {
            return null;
        }

        List<DailyWorkReportItemDTO> items = mapReportsToItems(reports);
        List<ShiftBreak> shiftBreaks = shiftBreakRepository.findAllByShift_Id(range.shiftId());

        long plannedMinutes = Duration.between(
                range.startDateTime(),
                range.endDateTime()).toMinutes();

        double efficiency = calculateEfficiency(items, plannedMinutes, shiftBreaks);

        return EmployeeWorkReportDTO.builder()
                .employeeId(emp.getId())
                .employeeCode(emp.getCode())
                .employeeName(emp.getName())
                .departmentName(emp.getDepartment() != null ? emp.getDepartment().getName() : null)
                .positionName(emp.getPosition() != null ? emp.getPosition().getName() : null)
                .startDateTime(range.startDateTime())
                .endDateTime(range.endDateTime())
                .checkinTime(range.checkinTime())
                .checkoutTime(range.checkoutTime())
                .workEfficiency(efficiency)
                .reports(items)
                .build();
    }

    @Override
    public List<EmployeeWorkReportDTO> getReportsByDate(LocalDate date) {
        Long currentEmployeeId = SecurityUtils.getCurrentEmployeeId();
        Employee currentEmployee = employeeRepository.findById(currentEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại"));

        List<Employee> employees;
        Role role = currentEmployee.getRole();
        if (role == Role.MANAGER) {
            employees = employeeRepository.findByDepartment_Id(currentEmployee.getDepartment().getId());
        } else if (role == Role.SUPERADMIN) {
            employees = reportRepository.findEmployeesWithReportsInTimeRange(
                    date.atStartOfDay(), date.atTime(LocalTime.MAX));
        } else if (role == Role.HEAD) {
            employees = employeeRepository
                    .findEmployeesInDepartmentAndSubDepartments(currentEmployee.getDepartment().getId());
        } else {
            employees = List.of(currentEmployee);
        }

        List<EmployeeWorkReportDTO> result = new ArrayList<>();

        for (Employee emp : employees) {
            EmployeeWorkReportDTO dto = buildEmployeeWorkReport(emp, date);
            if (dto != null) {
                result.add(dto);
            }
        }

        return result;
    }

    @Override
    public List<EmployeeWorkReportDTO> getReportsByEmployeeIdAndDate(Long employeeId, LocalDate date) {
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên"));

        EmployeeWorkReportDTO dto = buildEmployeeWorkReport(emp, date);
        return dto == null ? Collections.emptyList() : List.of(dto);
    }

    @Override
    public void createReport(Long employeeId, LocalDateTime startDateTime, LocalDateTime endDateTime,
            String taskDescription, MultipartFile file) {
        try {
            String fileName = null;
            if (file != null && !file.isEmpty()) {
                fileName = fileStorageService.storeFile(file);
            }

            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại"));

            DailyWorkReport report = new DailyWorkReport();
            report.setEmployee(employee);
            report.setStartDateTime(startDateTime);
            report.setEndDateTime(endDateTime);
            report.setTaskDescription(taskDescription);
            report.setFilePath(fileName);

            reportRepository.save(report);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lưu báo cáo", e);
        }
    }

    @Override
    public void updateReport(Long id, LocalDateTime startDateTime, LocalDateTime endDateTime,
            String taskDescription, MultipartFile file) {
        DailyWorkReport report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo với id: " + id));

        report.setStartDateTime(startDateTime);
        report.setEndDateTime(endDateTime);
        report.setTaskDescription(taskDescription);

        if (file != null && !file.isEmpty()) {
            if (report.getFilePath() != null && !report.getFilePath().isBlank()) {
                fileStorageService.deleteFile(report.getFilePath());
            }
            try {
                String newFilePath = fileStorageService.storeFile(file);
                report.setFilePath(newFilePath);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        reportRepository.save(report);
    }

    @Override
    public void deleteReport(Long id) {
        DailyWorkReport report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo với id: " + id));
        if (report.getFilePath() != null && !report.getFilePath().isBlank()) {
            fileStorageService.deleteFile(report.getFilePath());
        }
        reportRepository.delete(report);
    }
}