package htmp.codien.quanlycodien.modules.workschedule.controller;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.core.io.InputStreamResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.common.annotation.RequiresPermission;
import htmp.codien.quanlycodien.modules.workschedule.dto.overtime.OvertimeRequestDTO;
import htmp.codien.quanlycodien.modules.workschedule.dto.overtime.OvertimeRequestResponse;
import htmp.codien.quanlycodien.modules.workschedule.enums.WorkRequestStatus;
import htmp.codien.quanlycodien.modules.workschedule.service.overtime.OvertimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/overtimes")
@RequiredArgsConstructor
public class OvertimeController {
    private final OvertimeService overtimeService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createRequest(
            @RequestParam Long employeeId,
            @RequestParam LocalDateTime startTime,
            @RequestParam LocalDateTime endTime,
            @RequestParam String reason) {
        overtimeService.createRequest(employeeId, startTime, endTime, reason);
        return ResponseUtil.success(null, "Gửi yêu tăng ca thành công");
    }

    @PostMapping("/batch-create")
    public ResponseEntity<ApiResponse<Void>> createBatchOvertimeRequests(
            @RequestBody List<OvertimeRequestDTO> requests) {
        overtimeService.createBatchRequests(requests);
        return ResponseUtil.success(null, "Lập danh sách yêu cầu tăng ca thành công");
    }

    @GetMapping("/pending/{approverId}")
    public ResponseEntity<ApiResponse<List<OvertimeRequestResponse>>> getPendingRequests(
            @PathVariable Long approverId) {
        List<OvertimeRequestResponse> pendingRequests = overtimeService.getPendingRequestsForApprover(approverId);
        return ResponseUtil.success(pendingRequests, "Lấy danh sách yêu cầu đang chờ duyệt thành công");
    }

    @PostMapping("/{requestId}/approve")
    @RequiresPermission("OVERTIME_REQUEST_APPROVE")
    public ResponseEntity<ApiResponse<Void>> approveRequest(
            @PathVariable Long requestId,
            @RequestParam Long approverId,
            @RequestParam WorkRequestStatus action,
            @RequestParam(required = false) String comment) {

        overtimeService.approveRequest(requestId, approverId, action, comment);

        String message = (action == WorkRequestStatus.APPROVED)
                ? "Phê duyệt yêu cầu tăng ca thành công"
                : "Từ chối yêu cầu tăng ca thành công";

        return ResponseUtil.success(null, message);
    }

    @GetMapping("/my-requests/{employeeId}")
    public ResponseEntity<ApiResponse<List<OvertimeRequestResponse>>> getRequestsByEmployee(
            @PathVariable Long employeeId) {
        List<OvertimeRequestResponse> requests = overtimeService.getRequestsByEmployee(employeeId);
        return ResponseUtil.success(requests, "Lấy danh sách yêu cầu tăng ca của nhân viên thành công");
    }

    @GetMapping("/check-request")
    public ResponseEntity<ApiResponse<Boolean>> checkOvertimeRequest(
            @RequestParam Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        boolean exists = overtimeService.hasOvertimeRequestForDate(employeeId, date);
        return ResponseUtil.success(exists, "Kiểm tra yêu cầu tăng ca thành công");
    }

    @GetMapping("/history/{approverId}")
    public ResponseEntity<ApiResponse<List<OvertimeRequestResponse>>> getProcessedRequests(
            @PathVariable Long approverId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {

        List<OvertimeRequestResponse> requests = overtimeService.getProcessedRequestsForApprover(approverId, startDate,
                endDate);
        return ResponseUtil.success(requests, "Lấy lịch sử yêu cầu thành công");
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<ApiResponse<OvertimeRequestResponse>> getRequestDetail(@PathVariable Long requestId) {
        OvertimeRequestResponse request = overtimeService.getRequestDetail(requestId);
        return ResponseUtil.success(request, "Lấy chi tiết yêu cầu tăng ca thành công");
    }

    @GetMapping("/detect-shift-type")
    public ResponseEntity<String> detectNewShiftType(
            @RequestParam Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {

        String result = overtimeService.detectNewShiftType(employeeId, startTime, endTime);
        return ResponseEntity.ok(result != null ? result : "Không xác định được kíp");
    }

    @PostMapping("/assign")
    public ResponseEntity<ApiResponse<Void>> assignOvertime(
            @RequestParam Long managerId,
            @RequestParam Long employeeId,
            @RequestParam LocalDateTime startTime,
            @RequestParam LocalDateTime endTime,
            @RequestParam String reason) {

        overtimeService.assignOvertime(managerId, employeeId, startTime, endTime, reason);
        return ResponseUtil.success(null, "Giao tăng ca cho nhân viên thành công");
    }

    @PostMapping("/{requestId}/respond")
    public ResponseEntity<ApiResponse<Void>> respondAssignedOvertime(
            @PathVariable Long requestId,
            @RequestParam Long employeeId,
            @RequestParam WorkRequestStatus action,
            @RequestParam(required = false) String reason) {

        overtimeService.respondAssignedOvertime(requestId, employeeId, action, reason);

        String message = (action == WorkRequestStatus.APPROVED_BY_EMPLOYEE)
                ? "Đồng ý tăng ca thành công"
                : "Từ chối tăng ca thành công";

        return ResponseUtil.success(null, message);
    }


    @GetMapping("/assigned/{employeeId}")
    public ResponseEntity<ApiResponse<List<OvertimeRequestResponse>>> getAssignedOvertime(
            @PathVariable Long employeeId) {

        List<OvertimeRequestResponse> requests = overtimeService.getAssignedOvertimeRequests(employeeId);
        return ResponseUtil.success(requests, "Lấy danh sách OT được giao thành công");
    }

    @GetMapping("/history/creator/{creatorId}")
    public ResponseEntity<ApiResponse<List<OvertimeRequestResponse>>> getOvertimeRequestHistoryByCreator(
            @PathVariable Long creatorId) {

        List<OvertimeRequestResponse> history = overtimeService.getOvertimeRequestHistoryByCreator(creatorId);
        return ResponseUtil.success(history, "Lấy lịch sử yêu cầu tăng ca theo người tạo thành công");
    }


    @PostMapping("/direct-assign")
    public ResponseEntity<ApiResponse<Void>> directAssignOvertime(
            @RequestParam Long managerId,
            @RequestParam Long employeeId,
            @RequestParam LocalDateTime startTime,
            @RequestParam LocalDateTime endTime,
            @RequestParam String reason) {

        overtimeService.directAssignOvertime(managerId, employeeId, startTime, endTime, reason);

        return ResponseUtil.success(null, "Chỉ định tăng ca thành công");
    }

    @GetMapping("/export-approved")
    public ResponseEntity<InputStreamResource> exportApprovedOvertime(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        ByteArrayInputStream in = overtimeService.exportApprovedOvertimeToExcel(startDate, endDate);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=overtime_" + startDate + "_to_" + endDate + ".xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new InputStreamResource(in));
    }

}
