package htmp.codien.quanlycodien.modules.workschedule.service.overtime;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import htmp.codien.quanlycodien.modules.workschedule.dto.overtime.OvertimeRequestDTO;
import htmp.codien.quanlycodien.modules.workschedule.dto.overtime.OvertimeRequestResponse;
import htmp.codien.quanlycodien.modules.workschedule.enums.WorkRequestStatus;

public interface OvertimeService {

        void createRequest(Long employeeId, LocalDateTime start, LocalDateTime end, String reason);

        void approveRequest(Long requestId, Long approverId, WorkRequestStatus action, String comment);

        void assignOvertime(Long managerId, Long employeeId, LocalDateTime start, LocalDateTime end, String reason);

        void respondAssignedOvertime(Long requestId, Long employeeId, WorkRequestStatus action, String reason);

        List<OvertimeRequestResponse> getAssignedOvertimeRequests(Long employeeId);

        List<OvertimeRequestResponse> getOvertimeRequestHistoryByCreator(Long creatorId);

        void directAssignOvertime(Long managerId, Long employeeId, LocalDateTime start, LocalDateTime end,
                        String reason);

        List<OvertimeRequestResponse> getRequestsByEmployee(Long employeeId);

        List<OvertimeRequestResponse> getPendingRequestsForApprover(Long approverId);

        OvertimeRequestResponse getRequestDetail(Long requestId);

        List<OvertimeRequestResponse> getProcessedRequestsForApprover(Long approverId,
                        LocalDate startDate, LocalDate endDate);

        String detectNewShiftType(Long employeeId, LocalDateTime startTime, LocalDateTime endTime);

        boolean hasOvertimeRequestForDate(Long employeeId, LocalDate date);

        ByteArrayInputStream exportApprovedOvertimeToExcel(LocalDate startDate, LocalDate endDate);

        void createBatchRequests(List<OvertimeRequestDTO> requests);
}
