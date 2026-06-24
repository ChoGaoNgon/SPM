package htmp.codien.quanlycodien.modules.workschedule.service.overtime;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.common.enums.ApprovalLevel;
import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.common.exception.BadRequestException;
import htmp.codien.quanlycodien.common.exception.ConflictException;
import htmp.codien.quanlycodien.common.exception.ForbiddenException;
import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.modules.attendance.service.AttendanceService;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.employee.service.ApprovalLevelFinderHelper;
import htmp.codien.quanlycodien.modules.position.helper.PositionHelper;
import htmp.codien.quanlycodien.modules.workschedule.dto.overtime.OvertimeRequestDTO;
import htmp.codien.quanlycodien.modules.workschedule.dto.overtime.OvertimeRequestResponse;
import htmp.codien.quanlycodien.modules.workschedule.entity.OvertimeApproval;
import htmp.codien.quanlycodien.modules.workschedule.entity.OvertimeRequest;
import htmp.codien.quanlycodien.modules.workschedule.entity.Shift;
import htmp.codien.quanlycodien.modules.workschedule.entity.WorkSchedule;
import htmp.codien.quanlycodien.modules.workschedule.enums.WorkRequestStatus;
import htmp.codien.quanlycodien.modules.workschedule.helper.OvertimeHelper;
import htmp.codien.quanlycodien.modules.workschedule.repository.OvertimeApprovalRepository;
import htmp.codien.quanlycodien.modules.workschedule.repository.OvertimeRequestRepository;
import htmp.codien.quanlycodien.modules.workschedule.repository.ShiftRepository;
import htmp.codien.quanlycodien.modules.workschedule.repository.WorkScheduleRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OvertimeServiceImpl implements OvertimeService {

        private final OvertimeHelper overtimeHelper;
        private final EmployeeRepository employeeRepository;
        private final ShiftRepository shiftRepository;
        private final AttendanceService attendanceService;
        private final WorkScheduleRepository workScheduleRepository;
        private final OvertimeRequestRepository overtimeRequestRepository;
        private final OvertimeApprovalRepository overtimeApprovalRepository;
        private final ApprovalLevelFinderHelper approvalLevelFinderHelper;
        private final ModelMapper modelMapper;

        @Override
        public boolean hasOvertimeRequestForDate(Long employeeId, LocalDate date) {
                List<OvertimeRequest> requests = overtimeRequestRepository.findByEmployee_IdAndWorkDate(employeeId,
                                date);
                return !requests.isEmpty();
        }

        @Override
        @Transactional
        public void assignOvertime(Long managerId, Long employeeId, LocalDateTime start, LocalDateTime end,
                        String reason) {
                employeeRepository.findById(managerId)
                                .orElseThrow(() -> new ResourceNotFoundException("Người giao không tồn tại!"));
                Employee employee = employeeRepository.findById(employeeId)
                                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại!"));

                WorkSchedule schedule = workScheduleRepository
                                .findByEmployeeIdAndWorkDate(employeeId, start.toLocalDate())
                                .orElseThrow(() -> new ResourceNotFoundException("Ngày không có lịch làm việc!"));

                validateOTWithinWorkday(schedule, start, end);

                OvertimeRequest ot = OvertimeRequest.builder()
                                .employee(employee)
                                .workDate(start.toLocalDate())
                                .startTime(start)
                                .endTime(end)
                                .reason(reason)
                                .status(WorkRequestStatus.ASSIGN_EMPLOYEE)
                                .build();

                overtimeRequestRepository.save(ot);

        }

        @Override
        @Transactional
        public void respondAssignedOvertime(Long requestId, Long employeeId, WorkRequestStatus action, String comment) {

                OvertimeRequest request = overtimeRequestRepository.findById(requestId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu tăng ca!"));

                if (!request.getEmployee().getId().equals(employeeId)) {
                        throw new ForbiddenException("Bạn không có quyền phản hồi yêu cầu này!");
                }

                if (!(action == WorkRequestStatus.APPROVED_BY_EMPLOYEE
                                || action == WorkRequestStatus.REJECTED_BY_EMPLOYEE)) {
                        throw new BadRequestException("Trạng thái phản hồi không hợp lệ!");
                }

                request.setStatus(action);
                overtimeRequestRepository.save(request);

                if (action == WorkRequestStatus.APPROVED_BY_EMPLOYEE) {
                        updateWorkScheduleIfNeeded(request);
                        reprocessAttendanceIfNeeded(request);
                }

                OvertimeApproval log = OvertimeApproval.builder()
                                .request(request)
                                .approver(request.getEmployee())
                                .approvalLevel(ApprovalLevel.LEVEL0)
                                .action(action)
                                .comment(comment)
                                .build();

                overtimeApprovalRepository.save(log);

                //

        }

        @Override
        public List<OvertimeRequestResponse> getAssignedOvertimeRequests(Long employeeId) {
                List<WorkRequestStatus> assignedStatuses = List.of(
                                WorkRequestStatus.ASSIGN_EMPLOYEE,
                                WorkRequestStatus.APPROVED_BY_EMPLOYEE,
                                WorkRequestStatus.REJECTED_BY_EMPLOYEE);

                return overtimeRequestRepository
                                .findByEmployee_IdAndStatusIn(employeeId, assignedStatuses)
                                .stream()
                                .map(r -> modelMapper.map(r, OvertimeRequestResponse.class))
                                .toList();
        }

        @Override
        public List<OvertimeRequestResponse> getOvertimeRequestHistoryByCreator(Long creatorId) {
                Employee creator = employeeRepository.findById(Long.valueOf(creatorId))
                                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại!"));
                return overtimeRequestRepository
                                .findByCreatedByOrderByCreatedAtDesc(creator.getCode())
                                .stream()
                                .map(r -> modelMapper.map(r, OvertimeRequestResponse.class))
                                .toList();
        }

        @Override
        @Transactional
        public void directAssignOvertime(Long managerId, Long employeeId, LocalDateTime start, LocalDateTime end,
                        String reason) {

                Employee manager = employeeRepository.findById(managerId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người chỉ định!"));

                Employee employee = employeeRepository.findById(employeeId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên!"));

                boolean isLevel1Manager = PositionHelper.isLevel1Manager(manager.getPosition().getCode());

                WorkSchedule schedule = workScheduleRepository
                                .findByEmployeeIdAndWorkDate(employeeId, start.toLocalDate())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Ngày " + start.toLocalDate() + " không có lịch làm việc!"));

                validateOTWithinWorkday(schedule, start, end);

                OvertimeRequest ot = OvertimeRequest.builder()
                                .employee(employee)
                                .workDate(start.toLocalDate())
                                .startTime(start)
                                .endTime(end)
                                .reason(reason)
                                .status(WorkRequestStatus.ASSIGN_DIRECT)
                                .build();

                overtimeRequestRepository.save(ot);

                overtimeApprovalRepository.save(
                                OvertimeApproval.builder()
                                                .request(ot)
                                                .approver(manager)
                                                .approvalLevel(isLevel1Manager ? ApprovalLevel.LEVEL1
                                                                : ApprovalLevel.LEVEL2)

                                                .action(WorkRequestStatus.ASSIGN_DIRECT)
                                                .comment(reason)
                                                .build());

                updateWorkScheduleIfNeeded(ot);

                reprocessAttendanceIfNeeded(ot);

        }

        @Override
        @Transactional
        public void createRequest(Long employeeId, LocalDateTime start, LocalDateTime end, String reason) {

                Employee employee = employeeRepository.findById(employeeId)
                                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại!"));

                WorkSchedule schedule = workScheduleRepository
                                .findByEmployeeIdAndWorkDate(employeeId, start.toLocalDate())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Ngày " + start.toLocalDate() + " không có lịch làm việc!"));

                validateOTWithinWorkday(schedule, start, end);

                boolean isLevel1Manager = PositionHelper.isLevel1Manager(employee.getPosition().getCode());

                OvertimeRequest ot = OvertimeRequest.builder()
                                .employee(employee)
                                .workDate(start.toLocalDate())
                                .startTime(start)
                                .endTime(end)
                                .reason(reason)
                                .status(isLevel1Manager ? WorkRequestStatus.PENDING_HEAD
                                                : WorkRequestStatus.PENDING_MANAGER)
                                .build();

                overtimeRequestRepository.save(ot);

                sendCreateNotifications(employee, ot, isLevel1Manager);
        }

        @Override
        @Transactional
        public void createBatchRequests(List<OvertimeRequestDTO> requests) {
                Employee currentEmployee = SecurityUtils.getCurrentEmployee();

                for (OvertimeRequestDTO req : requests) {
                        Employee employee = employeeRepository.findById(req.getEmployeeId())
                                        .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại!"));

                        WorkSchedule schedule = workScheduleRepository
                                        .findByEmployeeIdAndWorkDate(req.getEmployeeId(),
                                                        req.getStartTime().toLocalDate())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Ngày " + req.getStartTime().toLocalDate()
                                                                        + " không có lịch làm việc!"));

                        validateOTWithinWorkday(schedule, req.getStartTime(), req.getEndTime());
                        boolean isLevel1Manager = PositionHelper.isLevel1Manager(employee.getPosition().getCode());

                        OvertimeRequest ot = OvertimeRequest.builder()
                                        .employee(employee)
                                        .workDate(req.getStartTime().toLocalDate())
                                        .startTime(req.getStartTime())
                                        .endTime(req.getEndTime())
                                        .reason(req.getTaskDescription())
                                        .status(isLevel1Manager ? WorkRequestStatus.PENDING_HEAD
                                                        : WorkRequestStatus.PENDING_MANAGER)
                                        .build();

                        overtimeRequestRepository.save(ot);
                }
                List<String> receivers = approvalLevelFinderHelper.findLevel1ManagersToString(currentEmployee.getId());

        }

        @Override
        public void approveRequest(Long requestId, Long approverId, WorkRequestStatus action, String comment) {

                OvertimeRequest request = overtimeRequestRepository.findById(requestId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu tăng ca!"));

                Employee approver = employeeRepository.findById(approverId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người duyệt!"));

                boolean isSuperAdmin = SecurityUtils.hasRole(Role.SUPERADMIN);

                ApprovalLevel level;
                if (!isSuperAdmin) {
                        level = detectApprovalLevel(approver.getPosition().getCode());
                } else {

                        level = (request.getStatus() == WorkRequestStatus.PENDING_MANAGER)
                                        ? ApprovalLevel.LEVEL1
                                        : ApprovalLevel.LEVEL2;
                }

                WorkRequestStatus newStatus = action == WorkRequestStatus.REJECTED
                                ? WorkRequestStatus.REJECTED
                                : handleApprovalFlow(request, approver, level, comment);

                request.setStatus(newStatus);
                overtimeRequestRepository.save(request);

                overtimeApprovalRepository.save(
                                OvertimeApproval.builder()
                                                .request(request)
                                                .approver(approver)
                                                .approvalLevel(level)
                                                .action(action)
                                                .comment(comment)
                                                .build());

                sendApprovalNotifications(request, approver, action, level, comment);
        }

        @Override
        public List<OvertimeRequestResponse> getRequestsByEmployee(Long employeeId) {
                return overtimeRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId)
                                .stream()
                                .map(r -> modelMapper.map(r, OvertimeRequestResponse.class))
                                .toList();
        }

        @Override
        public List<OvertimeRequestResponse> getPendingRequestsForApprover(Long approverId) {

                Employee approver = employeeRepository.findById(approverId)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy người duyệt!"));

                String code = approver.getPosition().getCode();
                Long deptId = approver.getDepartment().getId();

                boolean isSuperAdmin = SecurityUtils.hasRole(Role.SUPERADMIN);

                List<OvertimeRequest> list = isSuperAdmin ? overtimeRequestRepository.findAllByOrderByCreatedAtDesc()
                                : PositionHelper.isLevel1Manager(code)
                                                ? overtimeRequestRepository.findByStatusAndEmployee_Department_Id(
                                                                WorkRequestStatus.PENDING_MANAGER, deptId)

                                                : PositionHelper.isDepartmentHead(code)
                                                                ? overtimeRequestRepository
                                                                                .findByStatusAndEmployee_Department_ParentDepartment_Id(
                                                                                                WorkRequestStatus.PENDING_HEAD,
                                                                                                deptId)

                                                                : throwForbidden();

                return list.stream()
                                .map(r -> modelMapper.map(r, OvertimeRequestResponse.class))
                                .toList();
        }

        @Override
        public List<OvertimeRequestResponse> getProcessedRequestsForApprover(
                        Long approverId, LocalDate start, LocalDate end) {

                LocalDate from = (start != null) ? start : LocalDate.of(2000, 1, 1);
                LocalDate to = (end != null) ? end : LocalDate.now();

                return overtimeApprovalRepository
                                .findByApprover_IdAndRequest_WorkDateBetween(approverId, from, to)
                                .stream()
                                .map(a -> modelMapper.map(a.getRequest(), OvertimeRequestResponse.class))
                                .toList();
        }

        @Override
        public OvertimeRequestResponse getRequestDetail(Long requestId) {
                return overtimeRequestRepository.findById(requestId)
                                .map(r -> modelMapper.map(r, OvertimeRequestResponse.class))
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu!"));
        }

        @Override
        public String detectNewShiftType(Long employeeId, LocalDateTime start, LocalDateTime end) {
                return "Ca phát hiện " + overtimeHelper.detectOvertimeCode(employeeId, start, end);
        }


        private void validateOTWithinWorkday(WorkSchedule schedule, LocalDateTime start, LocalDateTime end) {
                if (schedule.getShift().getShiftCode().equalsIgnoreCase("NS")) {
                        throw new ConflictException("Không thể tăng ca khi đang nghỉ sinh");
                }

                if (!schedule.getShift().getShiftCode().equalsIgnoreCase("NT")) {

                        LocalTime s = schedule.getShift().getStartTime();
                        LocalTime e = schedule.getShift().getEndTime();

                        LocalDateTime shiftStart = start.toLocalDate().atTime(s);
                        LocalDateTime shiftEnd = start.toLocalDate().atTime(e);

                        boolean before = end.isBefore(shiftStart) || end.isEqual(shiftStart);
                        boolean after = start.isAfter(shiftEnd) || start.isEqual(shiftEnd);

                        if (!(before || after))
                                throw new BadRequestException("OT trong ngày chỉ được phép trước hoặc sau giờ làm.");
                }
        }

        private ApprovalLevel detectApprovalLevel(String positionCode) {
                if (PositionHelper.isDepartmentHead(positionCode))
                        return ApprovalLevel.LEVEL2;
                else
                        return ApprovalLevel.LEVEL1;
        }

        private WorkRequestStatus handleApprovalFlow(
                        OvertimeRequest request,
                        Employee approver,
                        ApprovalLevel level,
                        String comment) {

                if (request.getStatus() == WorkRequestStatus.PENDING_MANAGER && level == ApprovalLevel.LEVEL1) {

                        notifyLevel2(request);
                        return WorkRequestStatus.PENDING_HEAD;
                }

                if (request.getStatus() == WorkRequestStatus.PENDING_HEAD && level == ApprovalLevel.LEVEL2) {

                        updateWorkScheduleIfNeeded(request);
                        reprocessAttendanceIfNeeded(request);
                        return WorkRequestStatus.APPROVED;
                }

                throw new ForbiddenException("Bạn không có quyền duyệt ở giai đoạn này!");
        }

        private void sendCreateNotifications(Employee employee, OvertimeRequest ot, boolean isLevel1Manager) {
                List<String> receivers = isLevel1Manager
                                ? approvalLevelFinderHelper.findLevel2DepartmentHeadsToString(employee.getId())
                                : approvalLevelFinderHelper.findLevel1ManagersToString(employee.getId());

        }

        private void notifyLevel2(OvertimeRequest request) {
        }

        private void sendApprovalNotifications(
                        OvertimeRequest request,
                        Employee approver,
                        WorkRequestStatus action,
                        ApprovalLevel level,
                        String comment) {

                if (action == WorkRequestStatus.REJECTED) {
                }

                if (action == WorkRequestStatus.APPROVED && level == ApprovalLevel.LEVEL2) {
                }
        }

        private void updateWorkScheduleIfNeeded(OvertimeRequest request) {

                WorkSchedule schedule = workScheduleRepository
                                .findByEmployeeIdAndWorkDate(request.getEmployee().getId(), request.getWorkDate())
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch làm việc!"));

                if (schedule.getShift().getShiftCode().equalsIgnoreCase("NT")) {

                        String newShiftCode = overtimeHelper.detectOvertimeCode(
                                        request.getEmployee().getId(),
                                        request.getStartTime(),
                                        request.getEndTime());

                        Shift newShift = shiftRepository.findByShiftCode(newShiftCode)
                                        .orElseThrow(() -> new ResourceNotFoundException("Ca làm không tồn tại"));

                        schedule.setShift(newShift);
                        workScheduleRepository.save(schedule);
                }
        }

        private void reprocessAttendanceIfNeeded(OvertimeRequest request) {
                if (!request.getWorkDate().isAfter(LocalDate.now())) {
                        attendanceService.processAttendanceForEmployee(
                                        request.getEmployee().getId(),
                                        request.getWorkDate());
                }
        }

        private <T> T throwForbidden() {
                throw new ForbiddenException("Bạn không có quyền duyệt yêu cầu tăng ca!");
        }

        @Override
        public ByteArrayInputStream exportApprovedOvertimeToExcel(LocalDate startDate, LocalDate endDate) {
                List<String> statuses = List.of(
                                WorkRequestStatus.APPROVED.name(),
                                WorkRequestStatus.ASSIGN_DIRECT.name());
                List<Object[]> approvals = overtimeRequestRepository
                                .findOvertimeByStatus(statuses,
                                                startDate, endDate);

                try (Workbook workbook = new XSSFWorkbook()) {
                        Sheet sheet = workbook.createSheet(startDate + " - " + endDate);
                        Map<String, CellStyle> styles = createStyles(workbook);
                        createHeader(sheet, styles);
                        fillRequestData(sheet, approvals, styles);
                        for (int i = 0; i < 12; i++) {
                                sheet.autoSizeColumn(i);
                        }
                        ByteArrayOutputStream out = new ByteArrayOutputStream();
                        workbook.write(out);
                        return new ByteArrayInputStream(out.toByteArray());

                } catch (Exception e) {
                        throw new RuntimeException("Lỗi xuất Excel: " + e.getMessage(), e);
                }
        }

        private void fillRequestData(Sheet sheet, List<Object[]> approvals, Map<String, CellStyle> styles) {
                int rowIdx = 1;
                for (Object[] approval : approvals) {
                        Row row = sheet.createRow(rowIdx++);
                        int colIdx = 0;

                        for (int i = 0; i < approval.length; i++) {

                                Cell cell = row.createCell(colIdx++);

                                if (i == 2 && "ASSIGN_DIRECT"
                                                .equals(approval[i] != null ? approval[i].toString() : null)) {
                                        cell.setCellValue("APPROVED");
                                } else {
                                        cell.setCellValue(approval[i] != null ? approval[i].toString() : "");
                                }

                                if (i == 9) {
                                        cell.setCellValue("");
                                }

                                cell.setCellStyle(styles.get("base"));
                        }
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

        private void createHeader(Sheet sheet, Map<String, CellStyle> styles) {
                Row headerRow = sheet.createRow(0);
                int colIdx = 0;

                Cell cellCode = headerRow.createCell(colIdx++);
                cellCode.setCellValue("Mã NV");
                cellCode.setCellStyle(styles.get("base"));

                Cell cellName = headerRow.createCell(colIdx++);
                cellName.setCellValue("Họ và tên");
                cellName.setCellStyle(styles.get("base"));

                Cell cellStatus = headerRow.createCell(colIdx++);
                cellStatus.setCellValue("Trạng thái");
                cellStatus.setCellStyle(styles.get("base"));

                Cell cellDepartment = headerRow.createCell(colIdx++);
                cellDepartment.setCellValue("Bộ phận");
                cellDepartment.setCellStyle(styles.get("base"));

                Cell cellPosition = headerRow.createCell(colIdx++);
                cellPosition.setCellValue("Chức danh");
                cellPosition.setCellStyle(styles.get("base"));

                Cell cellStartDate = headerRow.createCell(colIdx++);
                cellStartDate.setCellValue("Ngày bắt đầu");
                cellStartDate.setCellStyle(styles.get("base"));

                Cell cellEndDate = headerRow.createCell(colIdx++);
                cellEndDate.setCellValue("Ngày kết thúc");
                cellEndDate.setCellStyle(styles.get("base"));

                Cell cellStartDateTime = headerRow.createCell(colIdx++);
                cellStartDateTime.setCellValue("Ngày giờ bắt đầu");
                cellStartDateTime.setCellStyle(styles.get("base"));

                Cell cellEndDateTime = headerRow.createCell(colIdx++);
                cellEndDateTime.setCellValue("Ngày giờ kết thúc");
                cellEndDateTime.setCellStyle(styles.get("base"));

                Cell cellOvertimeHours = headerRow.createCell(colIdx++);
                cellOvertimeHours.setCellValue("Giờ tăng ca");
                cellOvertimeHours.setCellStyle(styles.get("base"));

                Cell cellReason = headerRow.createCell(colIdx++);
                cellReason.setCellValue("Lý do tăng ca");
                cellReason.setCellStyle(styles.get("base"));
        }
}
