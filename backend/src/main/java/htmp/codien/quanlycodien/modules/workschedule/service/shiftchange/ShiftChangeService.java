package htmp.codien.quanlycodien.modules.workschedule.service.shiftchange;

import java.time.LocalDate;
import java.util.List;

import htmp.codien.quanlycodien.modules.workschedule.dto.shiftChange.ShiftChangeApprovalDTO;
import htmp.codien.quanlycodien.modules.workschedule.dto.shiftChange.ShiftChangeRequestDTO;
import htmp.codien.quanlycodien.modules.workschedule.enums.WorkRequestStatus;

public interface ShiftChangeService {

        ShiftChangeRequestDTO createRequest(Long employeeId, Long currentShiftId, Long requestedShiftId,
                        LocalDate workDate, String reason);

        ShiftChangeApprovalDTO approveRequest(Long requestId, Long approverId,
                        WorkRequestStatus action, String comment);

        List<ShiftChangeRequestDTO> getRequestsByEmployee(Long employeeId);

        List<ShiftChangeRequestDTO> getPendingRequestsForApprover(Long approverId);

        ShiftChangeRequestDTO getRequestDetail(Long requestId);

        List<ShiftChangeRequestDTO> getShiftChangeProcessedRequestsForApprover(Long approverId, LocalDate startDate,
                        LocalDate endDate);

        void directAssignShiftChange(Long managerId, Long employeeId, Long currentShiftId, Long requestedShiftId,
                        LocalDate workDate,
                        String reason);

        List<ShiftChangeRequestDTO> getShiftChangeRequestHistoryByCreator(Long creatorId);
}
