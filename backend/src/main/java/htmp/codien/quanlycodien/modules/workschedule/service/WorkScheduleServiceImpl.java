package htmp.codien.quanlycodien.modules.workschedule.service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.sql.PreparedStatement;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.modelmapper.ModelMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.common.util.ExcelUtils;
import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.modules.attendance.service.AttendanceService;
import htmp.codien.quanlycodien.modules.department.repository.DepartmentRepository;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.DailyScheduleDTO;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.DailyWorkScheduleStatsDTO;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.EmployeeScheduleRequest;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.EmployeeScheduleResponse;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.ExternalWorkScheduleDTO;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.MyScheduleResponse;
import htmp.codien.quanlycodien.modules.workschedule.entity.Shift;
import htmp.codien.quanlycodien.modules.workschedule.entity.WorkSchedule;
import htmp.codien.quanlycodien.modules.workschedule.helper.OffShifts;
import htmp.codien.quanlycodien.modules.workschedule.repository.ShiftRepository;
import htmp.codien.quanlycodien.modules.workschedule.repository.WorkScheduleRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkScheduleServiceImpl implements WorkScheduleService {
    private final ShiftRepository shiftRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceService attendanceService;
    private final DepartmentRepository departmentRepository;
    private final ModelMapper modelmapper;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void saveSchedulesOnce(List<EmployeeScheduleRequest> requests) {
        Long currentDepartmentId = SecurityUtils.getCurrentDepartmentId();
        if (requests.isEmpty()) {
            throw new RuntimeException("Dữ liệu trống");
        }

        LocalDate firstDate = LocalDate.parse(requests.get(0).getDays().keySet().iterator().next());
        int year = firstDate.getYear();
        int month = firstDate.getMonthValue();

        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        workScheduleRepository.deleteByWorkDateBetweenAndEmployee_Department_Id(start, end, currentDepartmentId);

        List<WorkSchedule> toSave = new ArrayList<>();
        for (EmployeeScheduleRequest req : requests) {
            Employee employee = employeeRepository.findById(req.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));

            for (var entry : req.getDays().entrySet()) {
                LocalDate date = LocalDate.parse(entry.getKey());
                Long shiftId = entry.getValue();

                if (shiftId == null)
                    continue;

                var shift = shiftRepository.findById(shiftId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy ca"));

                toSave.add(WorkSchedule.builder()
                        .employee(employee)
                        .shift(shift)
                        .workDate(date)
                        .isOvertime(false)
                        .status("ACTIVE")
                        .build());
            }
        }
        workScheduleRepository.saveAll(toSave);
    }

    @Override
    public List<EmployeeScheduleResponse> getWorkScheduleByDepartment(Long departmentId, String month, String year,
            boolean isCodeHcns) {
        LocalDate startDate = LocalDate.of(Integer.parseInt(year), Integer.parseInt(month), 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Object[]> rawResults = workScheduleRepository
                .findWorkSchedulesByDepartmentAndDate(departmentId, startDate, endDate);

        Map<Long, EmployeeScheduleResponse> map = new LinkedHashMap<>();

        for (Object[] row : rawResults) {
            Long empId = ((Number) row[0]).longValue();
            String empName = (String) row[1];
            String empCode = (String) row[2];
            String workDate = row[3].toString();
            String shiftCode = (String) row[5];
            String codeHcns = (String) row[6];

            map.computeIfAbsent(empId, id -> EmployeeScheduleResponse.builder()
                    .employeeId(empId)
                    .employeeName(empName)
                    .employeeCode(empCode)
                    .days(new LinkedHashMap<>())
                    .build());

            map.get(empId).getDays().put(workDate, isCodeHcns ? codeHcns : shiftCode);
        }

        return new ArrayList<>(map.values());
    }

    @Override
    public MyScheduleResponse getWorkScheduleByEmployee(Long employeeId, String month, String year) {

        LocalDate startDate = LocalDate.of(Integer.parseInt(year), Integer.parseInt(month), 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Object[]> rawResults = workScheduleRepository
                .findWorkSchedulesByEmployeeAndDate(employeeId, startDate, endDate);

        Map<Long, MyScheduleResponse> map = new LinkedHashMap<>();

        for (Object[] row : rawResults) {
            Long empId = ((Number) row[0]).longValue();
            String empName = (String) row[1];
            String empCode = (String) row[2];
            LocalDate workDate = ((java.sql.Date) row[3]).toLocalDate();
            String shiftCode = (String) row[5];
            LocalDateTime checkIn = row[6] != null ? ((java.sql.Timestamp) row[6]).toLocalDateTime() : null;
            LocalDateTime checkOut = row[7] != null ? ((java.sql.Timestamp) row[7]).toLocalDateTime() : null;
            Boolean isLate = ((Number) row[8]).intValue() == 1;
            Boolean isEarly = ((Number) row[9]).intValue() == 1;

            map.computeIfAbsent(empId, id -> MyScheduleResponse.builder()
                    .employeeId(empId)
                    .employeeName(empName)
                    .employeeCode(empCode)
                    .workSchedules(new LinkedHashMap<>())
                    .build());

            MyScheduleResponse resp = map.get(empId);
            resp.getWorkSchedules().put(workDate.toString(), resp.new DayAttendance(
                    shiftCode,
                    checkIn,
                    checkOut,
                    isLate,
                    isEarly));
        }

        return map.values().stream().findFirst().orElse(null);
    }

    @Override
    public ByteArrayInputStream exportWorkSchedule(Long departmentId, int year, int month) {
        List<EmployeeScheduleResponse> schedules = getWorkScheduleByDepartment(
                departmentId, String.valueOf(month), String.valueOf(year), true);
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Tháng " + month + " - " + year);
            Map<String, CellStyle> styles = createStyles(workbook);
            LocalDate start = LocalDate.of(year, month, 1);
            int daysInMonth = start.lengthOfMonth();

            createHeader(sheet, year, month, daysInMonth, styles);
            fillEmployeeData(sheet, schedules, year, month, daysInMonth, styles);

            for (int i = 0; i < daysInMonth + 3; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi xuất Excel: " + e.getMessage(), e);
        }
    }

    private Map<String, CellStyle> createStyles(Workbook workbook) {
        Map<String, CellStyle> styles = new HashMap<>();

        Font normalFont = workbook.createFont();
        normalFont.setFontName("Times New Roman");
        normalFont.setBold(false);

        CellStyle baseStyle = workbook.createCellStyle();
        baseStyle.setAlignment(HorizontalAlignment.CENTER);
        baseStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        baseStyle.setBorderBottom(BorderStyle.THIN);
        baseStyle.setBorderTop(BorderStyle.THIN);
        baseStyle.setBorderLeft(BorderStyle.THIN);
        baseStyle.setBorderRight(BorderStyle.THIN);
        baseStyle.setFont(normalFont);

        styles.put("base", baseStyle);
        return styles;
    }

    private void createHeader(Sheet sheet, int year, int month, int daysInMonth, Map<String, CellStyle> styles) {
        String[] weekdays = { "CN", "T2", "T3", "T4", "T5", "T6", "T7" };

        Row headerRow = sheet.createRow(0);
        int colIdx = 0;

        Cell cellCode = headerRow.createCell(colIdx++);
        cellCode.setCellValue("Mã NV");
        cellCode.setCellStyle(styles.get("base"));

        Cell cellName = headerRow.createCell(colIdx++);
        cellName.setCellValue("Họ và tên");
        cellName.setCellStyle(styles.get("base"));

        for (int d = 1; d <= daysInMonth; d++) {
            LocalDate date = LocalDate.of(year, month, d);
            String weekday = weekdays[date.getDayOfWeek().getValue() % 7];
            Cell c = headerRow.createCell(colIdx++);
            c.setCellValue(d + " - " + weekday);
            c.setCellStyle(styles.get("base"));
        }
    }

    private void fillEmployeeData(Sheet sheet, List<EmployeeScheduleResponse> schedules,
            int year, int month, int daysInMonth,
            Map<String, CellStyle> styles) {
        int rowIdx = 1;

        for (EmployeeScheduleResponse emp : schedules) {
            Row row = sheet.createRow(rowIdx++);
            int colIdx = 0;

            Cell codeCell = row.createCell(colIdx++);
            codeCell.setCellValue(emp.getEmployeeCode());
            codeCell.setCellStyle(styles.get("base"));

            Cell nameCell = row.createCell(colIdx++);
            nameCell.setCellValue(emp.getEmployeeName());
            nameCell.setCellStyle(styles.get("base"));

            for (int d = 1; d <= daysInMonth; d++) {
                LocalDate currentDate = LocalDate.of(year, month, d);
                String codeHcns = emp.getDays().getOrDefault(currentDate.toString(), "");
                Cell cell = row.createCell(colIdx++);
                cell.setCellValue(codeHcns);
                cell.setCellStyle(styles.get("base"));
            }
        }
    }

    @Override
    public void updateEmployeeShift(Long employeeId, LocalDate date, Long newShiftId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với id: " + employeeId));

        WorkSchedule schedule = workScheduleRepository.findByEmployeeAndWorkDate(employee, date).orElse(null);
        if (schedule == null) {
            throw new ResourceNotFoundException("Không tìm thấy lịch làm việc cho nhân viên trong ngày: " + date);
        }
        Shift newShift = shiftRepository.findById(newShiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ca với id: " + newShiftId));
        schedule.setShift(newShift);
        workScheduleRepository.save(schedule);

        if (OffShifts.isOffShift(schedule.getShift().getShiftCode())) {
            return;
        }

        attendanceService.processAttendanceForEmployee(employeeId, date);

    }

    @Override
    public DailyScheduleDTO getDailySchedule(Long employeeId, LocalDate date) {
        WorkSchedule ws = workScheduleRepository
                .findByEmployeeIdAndWorkDate(employeeId, date)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy lịch làm việc ngày " + date));

        return modelmapper.map(ws, DailyScheduleDTO.class);
    }

    public DailyWorkScheduleStatsDTO getDailyWorkScheduleStats(Long departmentId, LocalDate date) {

        List<Long> allDepartmentIds = departmentRepository.findDepartmentAndAllSubDepartmentIds(departmentId);

        List<Object[]> raw = workScheduleRepository
                .findWorkSchedulesByDepartmentsAndDateRange(allDepartmentIds, date, date);

        long HC = 0, C1 = 0, C2 = 0, C3 = 0, KO = 0, KD = 0;
        long P = 0, NKL = 0, NT = 0, NGHI_KHAC = 0;

        for (Object[] row : raw) {
            String code = (String) row[5];
            if (code == null)
                continue;

            if (code.startsWith("HC") && !code.startsWith("HC150") && !code.startsWith("HC200")
                    && !code.startsWith("HCL"))
                HC++;
            else if (code.startsWith("C1"))
                C1++;
            else if (code.startsWith("C2"))
                C2++;
            else if (code.startsWith("C3"))
                C3++;
            else if (code.startsWith("KO"))
                KO++;
            else if (code.startsWith("KD"))
                KD++;

            else if ("P".equals(code))
                P++;
            else if ("NKL".equals(code))
                NKL++;
            else if ("NT".equals(code) || "DLBT".equals(code))
                NT++;
            else
                NGHI_KHAC++;
        }

        long totalWorking = HC + C1 + C2 + C3 + KO + KD;
        long totalResting = P + NKL + NT + NGHI_KHAC;
        long total = totalWorking + totalResting;

        double percentWorking = total > 0 ? (totalWorking * 100.0 / total) : 0.0;
        double percentResting = total > 0 ? (totalResting * 100.0 / total) : 0.0;

        return DailyWorkScheduleStatsDTO.builder()
                .date(date.toString())
                .HC(HC)
                .C1(C1)
                .C2(C2)
                .C3(C3)
                .KO(KO)
                .KD(KD)
                .P(P)
                .NKL(NKL)
                .NT(NT)
                .other(NGHI_KHAC)
                .percentWorking(percentWorking)
                .percentResting(percentResting)
                .build();
    }

    @Override
    @Transactional
    public void importWorkSchedule(MultipartFile file, int month, int year) {
        Map<String, Employee> employeeCache = new HashMap<>();
        Map<String, Shift> shiftCache = new HashMap<>();

        try (InputStream is = file.getInputStream();
                Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(0);

            int daysInMonth = YearMonth.of(year, month).lengthOfMonth();

            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null)
                    continue;

                String employeeCode = ExcelUtils.getCellString(row, 0);
                if (employeeCode == null || employeeCode.isEmpty())
                    continue;

                Employee employee = employeeCache.get(employeeCode);
                if (employee == null) {
                    employee = employeeRepository.findByCode(employeeCode)
                            .orElseThrow(() -> new RuntimeException(
                                    "Không tìm thấy nhân viên với mã: " + employeeCode));
                    employeeCache.put(employeeCode, employee);
                }

                for (int day = 1; day <= daysInMonth; day++) {
                    int colIndex = day + 1;

                    String codeHcns = ExcelUtils.getCellString(row, colIndex).trim();

                    if (codeHcns.isEmpty())
                        continue;

                    Shift shift = shiftCache.get(codeHcns);
                    if (shift == null) {
                        shift = shiftRepository.findByCodeHcns(codeHcns)
                                .orElseThrow(() -> new RuntimeException(
                                        "Không tìm thấy ca với mã: " + codeHcns));
                        shiftCache.put(codeHcns, shift);
                    }

                    LocalDate dayDate = LocalDate.of(year, month, day);

                    saveWorkShift(employeeCache.get(employeeCode), dayDate, shiftCache.get(codeHcns));
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi import lịch làm việc: " + e.getMessage());
        }
    }

    private void saveWorkShift(Employee employee, LocalDate dayDate, Shift shift) {

        WorkSchedule existing = workScheduleRepository
                .findByEmployeeAndWorkDate(employee, dayDate)
                .orElse(null);

        if (existing != null) {

            existing.setShift(shift);
            existing.setStatus("ACTIVE");
            existing.setIsOvertime(false);
            workScheduleRepository.save(existing);
            return;
        }

        WorkSchedule ws = WorkSchedule.builder()
                .employee(employee)
                .workDate(dayDate)
                .shift(shift)
                .isOvertime(false)
                .status("ACTIVE")
                .build();

        workScheduleRepository.save(ws);
    }

    @Override
    @Transactional
    public void syncWorkScheduleFromExternalAPI(
            ExternalWorkScheduleDTO externalData,
            int year,
            int month,
            boolean useCodeHcns) {

        if (externalData == null || externalData.getData() == null) {
            throw new IllegalArgumentException("Dữ liệu từ API không hợp lệ");
        }

        long startTime = System.currentTimeMillis();

        int daysInMonth = YearMonth.of(year, month).lengthOfMonth();
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(daysInMonth);

        int totalEmployees = externalData.getData().size();

        System.out.println("\n========== SYNC WORK SCHEDULE ==========");
        System.out.println("Month: " + month + "/" + year +
                " | Employees: " + totalEmployees);

        System.out.println("[STEP 1] Loading employees...");
        List<String> employeeCodes = new ArrayList<>(externalData.getData().keySet());
        List<Employee> employees = employeeRepository.findByCodeIn(employeeCodes);

        Map<String, Employee> employeeCache = new HashMap<>(employees.size());
        for (Employee emp : employees) {
            employeeCache.put(emp.getCode(), emp);
        }
        System.out.println("[STEP 1 DONE] Found employees in DB: " + employees.size());

        System.out.println("[STEP 2] Loading shifts...");
        List<Shift> shifts = shiftRepository.findAll();
        Map<String, Shift> shiftCache = new HashMap<>(shifts.size());

        for (Shift shift : shifts) {
            if (shift.getCodeHcns() != null) {
                shiftCache.put(shift.getCodeHcns(), shift);
            }
        }
        System.out.println("[STEP 2 DONE] Shift loaded: " + shiftCache.size());

        System.out.println("[STEP 3] Loading existing schedules...");
        List<Long> employeeIds = employees.stream()
                .map(Employee::getId)
                .toList();

        List<WorkSchedule> existingSchedules = workScheduleRepository.findByEmployeeIdInAndWorkDateBetween(
                employeeIds,
                startDate,
                endDate);

        System.out.println("[STEP 3 DONE] Existing schedules: " + existingSchedules.size());

        Map<Long, Map<LocalDate, WorkSchedule>> scheduleMap = new HashMap<>(existingSchedules.size());

        for (WorkSchedule ws : existingSchedules) {
            scheduleMap
                    .computeIfAbsent(ws.getEmployee().getId(), k -> new HashMap<>())
                    .put(ws.getWorkDate(), ws);
        }

        List<LocalDate> dates = new ArrayList<>(daysInMonth);
        String[] shiftKeys = new String[daysInMonth];

        for (int i = 0; i < daysInMonth; i++) {
            dates.add(LocalDate.of(year, month, i + 1));
            shiftKeys[i] = "SHIFT_ID_" + (i + 1);
        }

        int estimatedRecords = totalEmployees * daysInMonth / 2;
        List<WorkSchedule> toSave = new ArrayList<>(estimatedRecords);
        List<WorkSchedule> toUpdate = new ArrayList<>(estimatedRecords / 10);

        int skippedEmployees = 0;
        int unchangedCount = 0;
        int processedEmployees = 0;

        System.out.println("[STEP 5] Start processing data...");

        for (Map.Entry<String, Map<String, String>> employeeEntry : externalData.getData().entrySet()) {

            processedEmployees++;

            if (processedEmployees % 50 == 0) {
                long now = System.currentTimeMillis();
                double seconds = (now - startTime) / 1000.0;

                System.out.println(String.format(
                        "[PROGRESS] %d/%d employees | New=%d | Update=%d | Time=%.2fs",
                        processedEmployees,
                        totalEmployees,
                        toSave.size(),
                        toUpdate.size(),
                        seconds));
            }

            String employeeCode = employeeEntry.getKey();
            Map<String, String> shiftsData = employeeEntry.getValue();

            Employee employee = employeeCache.get(employeeCode);

            if (employee == null) {
                skippedEmployees++;
                System.out.println("[SKIP] Employee not found in DB: " + employeeCode);
                continue;
            }

            Long empId = employee.getId();
            Map<LocalDate, WorkSchedule> empSchedules = scheduleMap.get(empId);

            int createdForEmployee = 0;
            int updatedForEmployee = 0;

            for (int i = 0; i < daysInMonth; i++) {

                String shiftCode = shiftsData.get(shiftKeys[i]);

                if (shiftCode == null || shiftCode.isBlank()) {
                    continue;
                }

                Shift shift = shiftCache.get(shiftCode);
                if (shift == null) {
                    continue;
                }

                LocalDate workDate = dates.get(i);

                WorkSchedule existing = empSchedules != null ? empSchedules.get(workDate) : null;

                if (existing == null) {

                    WorkSchedule newSchedule = WorkSchedule.builder()
                            .employee(employee)
                            .workDate(workDate)
                            .shift(shift)
                            .isOvertime(false)
                            .status("ACTIVE")
                            .build();

                    toSave.add(newSchedule);
                    createdForEmployee++;

                } else {

                    Long existingShiftId = existing.getShift() != null
                            ? existing.getShift().getId()
                            : null;

                    if (!Objects.equals(existingShiftId, shift.getId())) {

                        existing.setShift(shift);
                        existing.setStatus("ACTIVE");
                        existing.setIsOvertime(false);

                        toUpdate.add(existing);
                        updatedForEmployee++;

                    } else {
                        unchangedCount++;
                    }
                }
            }

            if (createdForEmployee > 0 || updatedForEmployee > 0) {
                System.out.println(String.format(
                        "[EMPLOYEE] %s | Created: %d | Updated: %d",
                        employeeCode,
                        createdForEmployee,
                        updatedForEmployee));
            }
        }

        System.out.println("[STEP 6] Saving to database with JDBC batch...");
        System.out.println("Insert: " + toSave.size());
        System.out.println("Update: " + toUpdate.size());

        long dbStartTime = System.currentTimeMillis();

        if (!toSave.isEmpty()) {
            String insertSql = "INSERT INTO work_schedules (employee_id, work_date, shift_id, is_overtime, status, created_at, updated_at) "
                    +
                    "VALUES (?, ?, ?, ?, ?, NOW(), NOW())";

            int batchSize = 1000;
            for (int i = 0; i < toSave.size(); i += batchSize) {
                int end = Math.min(i + batchSize, toSave.size());
                List<WorkSchedule> batch = toSave.subList(i, end);

                jdbcTemplate.batchUpdate(insertSql, batch, batch.size(), (PreparedStatement ps, WorkSchedule ws) -> {
                    ps.setLong(1, ws.getEmployee().getId());
                    ps.setObject(2, ws.getWorkDate());
                    ps.setLong(3, ws.getShift().getId());
                    ps.setBoolean(4, ws.getIsOvertime());
                    ps.setString(5, ws.getStatus());
                });

                System.out.println("[JDBC INSERT] " + end + "/" + toSave.size());
            }
        }

        if (!toUpdate.isEmpty()) {
            String updateSql = "UPDATE work_schedules SET shift_id = ?, status = ?, is_overtime = ?, updated_at = NOW() "
                    +
                    "WHERE employee_id = ? AND work_date = ?";

            int batchSize = 1000;
            for (int i = 0; i < toUpdate.size(); i += batchSize) {
                int end = Math.min(i + batchSize, toUpdate.size());
                List<WorkSchedule> batch = toUpdate.subList(i, end);

                jdbcTemplate.batchUpdate(updateSql, batch, batch.size(), (PreparedStatement ps, WorkSchedule ws) -> {
                    ps.setLong(1, ws.getShift().getId());
                    ps.setString(2, ws.getStatus());
                    ps.setBoolean(3, ws.getIsOvertime());
                    ps.setLong(4, ws.getEmployee().getId());
                    ps.setObject(5, ws.getWorkDate());
                });

                System.out.println("[JDBC UPDATE] " + end + "/" + toUpdate.size());
            }
        }

        long dbDuration = System.currentTimeMillis() - dbStartTime;
        System.out.println(String.format("[STEP 6 DONE] DB operations completed in %.2fs", dbDuration / 1000.0));

        long duration = System.currentTimeMillis() - startTime;

        int totalProcessed = toSave.size() + toUpdate.size() + unchangedCount;

        System.out.println("========== RESULT ==========");
        System.out.println(String.format(
                "Success: %d records (New: %d | Updated: %d | Unchanged: %d)",
                totalProcessed,
                toSave.size(),
                toUpdate.size(),
                unchangedCount));

        System.out.println(String.format(
                "Performance: %.2f seconds | ~%.0f records/s | Skipped: %d employees",
                duration / 1000.0,
                totalProcessed / (duration / 1000.0),
                skippedEmployees));

        System.out.println("============================\n");
    }
}