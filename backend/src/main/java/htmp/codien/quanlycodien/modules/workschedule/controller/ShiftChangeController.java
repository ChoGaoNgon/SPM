package htmp.codien.quanlycodien.modules.workschedule.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.workschedule.dto.shiftChange.ShiftChangeApprovalDTO;
import htmp.codien.quanlycodien.modules.workschedule.dto.shiftChange.ShiftChangeRequestDTO;
import htmp.codien.quanlycodien.modules.workschedule.enums.WorkRequestStatus;
import htmp.codien.quanlycodien.modules.workschedule.service.shiftchange.ShiftChangeService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/shift-change")
@RequiredArgsConstructor
public class ShiftChangeController {

    private final ShiftChangeService shiftChangeService;

    @PostMapping
    public ResponseEntity<ApiResponse<ShiftChangeRequestDTO>> createRequest(
            @RequestParam Long employeeId,
            @RequestParam Long currentShiftId,
            @RequestParam Long requestedShiftId,
            @RequestParam LocalDate workDate,
            @RequestParam(required = false) String reason) {

        ShiftChangeRequestDTO request = shiftChangeService.createRequest(employeeId, currentShiftId, requestedShiftId,
                workDate, reason);

        return ResponseUtil.success(request, "Gửi yêu cầu đổi ca thành công");
    }

    @GetMapping("/my-requests/{employeeId}")
    public ResponseEntity<ApiResponse<List<ShiftChangeRequestDTO>>> getRequestsByEmployee(
            @PathVariable Long employeeId) {
        List<ShiftChangeRequestDTO> requests = shiftChangeService.getRequestsByEmployee(employeeId);
        return ResponseUtil.success(requests, "Lấy danh sách yêu cầu đổi ca của nhân viên thành công");
    }

    @GetMapping("/pending/{approverId}")
    public ResponseEntity<ApiResponse<List<ShiftChangeRequestDTO>>> getPendingRequests(@PathVariable Long approverId) {
        List<ShiftChangeRequestDTO> pendingRequests = shiftChangeService.getPendingRequestsForApprover(approverId);
        return ResponseUtil.success(pendingRequests, "Lấy danh sách yêu cầu đang chờ duyệt thành công");
    }

    @GetMapping("/history/{approverId}")
    public ResponseEntity<ApiResponse<List<ShiftChangeRequestDTO>>> getShiftChangeProcessedRequests(
            @PathVariable Long approverId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {

        List<ShiftChangeRequestDTO> requests = shiftChangeService.getShiftChangeProcessedRequestsForApprover(approverId,
                startDate,
                endDate);
        return ResponseUtil.success(requests, "Lấy lịch sử yêu cầu thành công");
    }

    @PostMapping("/{requestId}/approve")
    public ResponseEntity<ApiResponse<ShiftChangeApprovalDTO>> approveRequest(
            @PathVariable Long requestId,
            @RequestParam Long approverId,
            @RequestParam WorkRequestStatus action,
            @RequestParam(required = false) String comment) {

        ShiftChangeApprovalDTO approval = shiftChangeService.approveRequest(
                requestId,
                approverId,
                action,
                comment);

        String message = (action == WorkRequestStatus.APPROVED)
                ? "Phê duyệt yêu cầu đổi ca thành công"
                : "Từ chối yêu cầu đổi ca thành công";

        return ResponseUtil.success(approval, message);
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<ApiResponse<ShiftChangeRequestDTO>> getRequestDetail(@PathVariable Long requestId) {
        ShiftChangeRequestDTO request = shiftChangeService.getRequestDetail(requestId);
        return ResponseUtil.success(request, "Lấy chi tiết yêu cầu đổi ca thành công");
    }

    @GetMapping("/history/creator/{creatorId}")
    public ResponseEntity<ApiResponse<List<ShiftChangeRequestDTO>>> getOvertimeRequestHistoryByCreator(
            @PathVariable Long creatorId) {

        List<ShiftChangeRequestDTO> history = shiftChangeService.getShiftChangeRequestHistoryByCreator(creatorId);
        return ResponseUtil.success(history, "Lấy lịch sử yêu cầu đổi ca theo người tạo thành công");
    }


    @PostMapping("/direct-assign")
    public ResponseEntity<ApiResponse<Void>> directAssignOvertime(
            @RequestParam Long managerId,
            @RequestParam Long employeeId,
            @RequestParam Long currentShiftId,
            @RequestParam Long requestedShiftId,
            @RequestParam LocalDate workDate,
            @RequestParam(required = false) String reason) {

        shiftChangeService.directAssignShiftChange(managerId, employeeId, currentShiftId, requestedShiftId, workDate,
                reason);

        return ResponseUtil.success(null, "Chỉ định đổi ca thành công");
    }
}
