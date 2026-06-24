package htmp.codien.quanlycodien.modules.workschedule.service.shiftchange;

import java.time.LocalDate;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.common.enums.ApprovalLevel;
import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.common.exception.ForbiddenException;
import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.modules.attendance.service.AttendanceService;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.position.helper.PositionHelper;
import htmp.codien.quanlycodien.modules.workschedule.dto.shiftChange.ShiftChangeApprovalDTO;
import htmp.codien.quanlycodien.modules.workschedule.dto.shiftChange.ShiftChangeRequestDTO;
import htmp.codien.quanlycodien.modules.workschedule.entity.Shift;
import htmp.codien.quanlycodien.modules.workschedule.entity.ShiftChangeApproval;
import htmp.codien.quanlycodien.modules.workschedule.entity.ShiftChangeRequest;
import htmp.codien.quanlycodien.modules.workschedule.entity.WorkSchedule;
import htmp.codien.quanlycodien.modules.workschedule.enums.WorkRequestStatus;
import htmp.codien.quanlycodien.modules.workschedule.helper.OffShifts;
import htmp.codien.quanlycodien.modules.workschedule.repository.ShiftChangeApprovalRepository;
import htmp.codien.quanlycodien.modules.workschedule.repository.ShiftChangeRequestRepository;
import htmp.codien.quanlycodien.modules.workschedule.repository.ShiftRepository;
import htmp.codien.quanlycodien.modules.workschedule.repository.WorkScheduleRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ShiftChangeServiceImpl implements ShiftChangeService {

        private final ShiftChangeRequestRepository shiftChangeRequestRepository;
        private final ShiftChangeApprovalRepository shiftChangeApprovalRepository;
        private final EmployeeRepository employeeRepository;
        private final WorkScheduleRepository workScheduleRepository;

        private final AttendanceService attendanceService;
        private final ModelMapper modelMapper;
        private final ShiftRepository shiftRepository;

        @Override
        public ShiftChangeRequestDTO createRequest(
                        Long employeeId,
                        Long currentShiftId,
                        Long requestedShiftId,
                        LocalDate date,
                        String reason) {

                Employee emp = employeeRepository.findById(employeeId)
                                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại!"));

                WorkSchedule schedule = workScheduleRepository.findByEmployeeIdAndWorkDate(employeeId, date)
                                .orElseThrow(() -> new ResourceNotFoundException("Không có lịch làm việc để đổi ca!"));

                validateNotHoliday(schedule);

                boolean level1 = PositionHelper.isLevel1Manager(emp.getPosition().getCode());

                ShiftChangeRequest req = ShiftChangeRequest.builder()
                                .employee(emp)
                                .currentShift(new Shift(currentShiftId))
                                .requestedShift(new Shift(requestedShiftId))
                                .workDate(date)
                                .reason(reason)
                                .status(level1 ? WorkRequestStatus.PENDING_HEAD : WorkRequestStatus.PENDING_MANAGER)
                                .build();

                shiftChangeRequestRepository.save(req);
                sendCreateNotifications(emp, req, level1);

                return modelMapper.map(req, ShiftChangeRequestDTO.class);
        }

        @Override
        public ShiftChangeApprovalDTO approveRequest(
                        Long requestId,
                        Long approverId,
                        WorkRequestStatus action,
                        String comment) {

                ShiftChangeRequest req = shiftChangeRequestRepository.findById(requestId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu đổi ca!"));

                Employee approver = employeeRepository.findById(approverId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người duyệt!"));

                boolean isSuperAdmin = SecurityUtils.hasRole(Role.SUPERADMIN);

                ApprovalLevel level;
                if (!isSuperAdmin) {
                        level = detectApprovalLevel(approver);
                } else {

                        level = (req.getStatus() == WorkRequestStatus.PENDING_MANAGER)
                                        ? ApprovalLevel.LEVEL1
                                        : ApprovalLevel.LEVEL2;
                }

                WorkRequestStatus newStatus = (action == WorkRequestStatus.REJECTED)
                                ? WorkRequestStatus.REJECTED
                                : handleApprovalFlow(req, approver, level);

                req.setStatus(newStatus);
                shiftChangeRequestRepository.save(req);

                ShiftChangeApproval approval = shiftChangeApprovalRepository.save(
                                ShiftChangeApproval.builder()
                                                .request(req)
                                                .approver(approver)
                                                .approvalLevel(level)
                                                .action(action)
                                                .comment(comment)
                                                .build());

                sendApprovalNotifications(req, approver, action, level, comment);

                return modelMapper.map(approval, ShiftChangeApprovalDTO.class);
        }

        @Override
        public List<ShiftChangeRequestDTO> getRequestsByEmployee(Long employeeId) {
                return shiftChangeRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId)
                                .stream().map(r -> modelMapper.map(r, ShiftChangeRequestDTO.class))
                                .toList();
        }

        @Override
        public List<ShiftChangeRequestDTO> getPendingRequestsForApprover(Long approverId) {

                Employee approver = employeeRepository.findById(approverId)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy người duyệt!"));

                String code = approver.getPosition().getCode();
                Long deptId = approver.getDepartment().getId();
                boolean isSuperAdmin = SecurityUtils.hasRole(Role.SUPERADMIN);

                List<ShiftChangeRequest> list = isSuperAdmin
                                ? shiftChangeRequestRepository.findAllByOrderByCreatedAtDesc()
                                : PositionHelper.isLevel1Manager(code)
                                                ? shiftChangeRequestRepository.findByStatusAndEmployee_Department_Id(
                                                                WorkRequestStatus.PENDING_MANAGER, deptId)
                                                : PositionHelper.isDepartmentHead(code)
                                                                ? shiftChangeRequestRepository
                                                                                .findByStatusAndEmployee_Department_ParentDepartment_Id(
                                                                                                WorkRequestStatus.PENDING_HEAD,
                                                                                                deptId)
                                                                : throwForbiddenList();

                return list.stream()
                                .map(r -> modelMapper.map(r, ShiftChangeRequestDTO.class))
                                .toList();
        }

        @Override
        public List<ShiftChangeRequestDTO> getShiftChangeProcessedRequestsForApprover(
                        Long approverId,
                        LocalDate start,
                        LocalDate end) {

                LocalDate from = (start != null) ? start : LocalDate.of(2000, 1, 1);
                LocalDate to = (end != null) ? end : LocalDate.now();
                List<ShiftChangeRequestDTO> shiftChangeRequestDTOs = shiftChangeApprovalRepository
                                .findByApprover_IdAndRequest_WorkDateBetween(approverId, from, to)
                                .stream()
                                .map(a -> modelMapper.map(a.getRequest(), ShiftChangeRequestDTO.class))
                                .toList();
                return shiftChangeRequestDTOs;
        }

        @Override
        public ShiftChangeRequestDTO getRequestDetail(Long requestId) {
                return shiftChangeRequestRepository.findById(requestId)
                                .map(r -> modelMapper.map(r, ShiftChangeRequestDTO.class))
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu đổi ca!"));
        }

        private void validateNotHoliday(WorkSchedule schedule) {
                String code = schedule.getShift().getShiftCode();
                if (code.equals("NT") || code.equals("P") || code.equals("L"))
                        throw new RuntimeException("Không thể đổi ca trong ngày nghỉ!");
        }

        private ApprovalLevel detectApprovalLevel(Employee approver) {
                String code = approver.getPosition().getCode();
                if (PositionHelper.isLevel1Manager(code))
                        return ApprovalLevel.LEVEL1;
                if (PositionHelper.isDepartmentHead(code))
                        return ApprovalLevel.LEVEL2;
                throw new ForbiddenException("Bạn không có quyền duyệt yêu cầu này!");
        }

        private WorkRequestStatus handleApprovalFlow(
                        ShiftChangeRequest req,
                        Employee approver,
                        ApprovalLevel level) {

                if (req.getStatus() == WorkRequestStatus.PENDING_MANAGER && level == ApprovalLevel.LEVEL1) {
                        notifyLevel2(req);
                        return WorkRequestStatus.PENDING_HEAD;
                }

                if (req.getStatus() == WorkRequestStatus.PENDING_HEAD && level == ApprovalLevel.LEVEL2) {

                        updateSchedule(req);
                        reprocessAttendanceIfNeeded(req);
                        return WorkRequestStatus.APPROVED;
                }

                throw new ForbiddenException("Bạn không có quyền duyệt ở giai đoạn này!");
        }

        private void sendCreateNotifications(Employee emp, ShiftChangeRequest req, boolean level1) {
        }

        private void notifyLevel2(ShiftChangeRequest req) {
        }

        private void sendApprovalNotifications(
                        ShiftChangeRequest req,
                        Employee approver,
                        WorkRequestStatus action,
                        ApprovalLevel level,
                        String comment) {

        }

        private void updateSchedule(ShiftChangeRequest req) {
                WorkSchedule schedule = workScheduleRepository
                                .findByEmployeeIdAndWorkDate(req.getEmployee().getId(), req.getWorkDate())
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch làm việc!"));

                schedule.setShift(req.getRequestedShift());
                workScheduleRepository.save(schedule);

                Shift shift = schedule.getShift();

                if (shift == null) {
                        throw new RuntimeException("Shift chưa được gán!");
                }

                if (OffShifts.isOffShift(shift.getShiftCode())) {
                        return;
                }

                reprocessAttendanceIfNeeded(req);
        }

        private void reprocessAttendanceIfNeeded(ShiftChangeRequest req) {
                if (!req.getWorkDate().isAfter(LocalDate.now())) {
                        attendanceService.processAttendanceForEmployee(
                                        req.getEmployee().getId(),
                                        req.getWorkDate());
                }
        }

        private <T> T throwForbiddenList() {
                throw new ForbiddenException("Bạn không có quyền duyệt yêu cầu đổi ca!");
        }

        @Override
        @Transactional
        public void directAssignShiftChange(Long managerId, Long employeeId, Long currentShiftId, Long requestedShiftId,
                        LocalDate workDate,
                        String reason) {
                Employee manager = employeeRepository.findById(managerId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người chỉ định!"));

                Employee employee = employeeRepository.findById(employeeId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên!"));

                boolean isLevel1Manager = PositionHelper.isLevel1Manager(manager.getPosition().getCode());

                Shift currentShift = shiftRepository.findById(currentShiftId)
                                .orElseThrow(() -> new ResourceNotFoundException("Shift hiện tại không tồn tại"));

                Shift requestedShift = shiftRepository.findById(requestedShiftId)
                                .orElseThrow(() -> new ResourceNotFoundException("Shift yêu cầu không tồn tại"));

                ShiftChangeRequest shiftChangeRequest = ShiftChangeRequest.builder()
                                .employee(employee)
                                .workDate(workDate)
                                .currentShift(currentShift)
                                .requestedShift(requestedShift)
                                .reason(reason)
                                .status(WorkRequestStatus.ASSIGN_DIRECT)
                                .build();

                shiftChangeRequestRepository.save(shiftChangeRequest);

                shiftChangeApprovalRepository.save(
                                ShiftChangeApproval.builder()
                                                .request(shiftChangeRequest)
                                                .approver(manager)
                                                .approvalLevel(isLevel1Manager ? ApprovalLevel.LEVEL1
                                                                : ApprovalLevel.LEVEL2)

                                                .action(WorkRequestStatus.ASSIGN_DIRECT)
                                                .comment(reason)
                                                .build());

                updateSchedule(shiftChangeRequest);

        }

        @Override
        public List<ShiftChangeRequestDTO> getShiftChangeRequestHistoryByCreator(Long creatorId) {
                Employee creator = employeeRepository.findById(Long.valueOf(creatorId))
                                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại!"));
                return shiftChangeRequestRepository
                                .findByCreatedByOrderByCreatedAtDesc(creator.getCode())
                                .stream()
                                .map(r -> modelMapper.map(r, ShiftChangeRequestDTO.class))
                                .toList();
        }
}
