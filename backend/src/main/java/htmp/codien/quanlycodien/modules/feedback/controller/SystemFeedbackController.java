package htmp.codien.quanlycodien.modules.feedback.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.common.annotation.RequiresPermission;
import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackAssignRequest;
import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackCreateRequest;
import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackDashboardResponse;
import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackResponse;
import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackSummaryResponse;
import htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus;
import htmp.codien.quanlycodien.modules.feedback.service.SystemFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/system-feedbacks")
@RequiredArgsConstructor
public class SystemFeedbackController {
    private final SystemFeedbackService feedbackService;

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<ApiResponse<Void>> createFeedback(
            @RequestPart("data") SystemFeedbackCreateRequest req,
            @RequestPart(value = "uploadFiles", required = false) List<MultipartFile> uploadFiles,
            @RequestPart(value = "keptOldFiles", required = false) String keptOldFilesJson,
            @RequestPart(value = "deletedOldFiles", required = false) String deletedOldFilesJson) {
        feedbackService.createFeedback(req, uploadFiles, keptOldFilesJson, deletedOldFilesJson);
        return ResponseUtil.success(null, "Gửi góp ý thành công");
    }

    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    public ResponseEntity<ApiResponse<Void>> updateFeedback(
            @PathVariable Long id,
            @RequestPart("data") SystemFeedbackCreateRequest req,
            @RequestPart(value = "uploadFiles", required = false) List<MultipartFile> uploadFiles,
            @RequestPart(value = "keptOldFiles", required = false) String keptOldFilesJson,
            @RequestPart(value = "deletedOldFiles", required = false) String deletedOldFilesJson) {
        feedbackService.updateFeedback(id, req, uploadFiles, keptOldFilesJson, deletedOldFilesJson);
        return ResponseUtil.success(null, "Cập nhật góp ý thành công");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SystemFeedbackResponse>> getFeedbackById(@PathVariable Long id) {
        SystemFeedbackResponse resp = feedbackService.getFeedbackById(id);
        return ResponseUtil.success(resp, "Lấy góp ý thành công");
    }

    @GetMapping("/dashboard-it")
    public ResponseEntity<ApiResponse<SystemFeedbackDashboardResponse>> getDashboardData() {
        SystemFeedbackDashboardResponse response = feedbackService.getDashboardData();
        return ResponseUtil.success(response, "Lấy dữ liệu dashboard IT thành công");
    }

    @PatchMapping("/{id}/assign")
    @RequiresPermission("SYSTEM_FEEDBACK_ASSIGN")
    public ResponseEntity<ApiResponse<Void>> assignFeedback(
            @PathVariable Long id,
            @RequestBody SystemFeedbackAssignRequest request) {
        feedbackService.assignFeedback(id, request);
        return ResponseUtil.success(null, "Gán góp việc thành công");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SystemFeedbackSummaryResponse>>> getAllFeedbacks(
            @RequestParam(required = false) String employeeCode,
            @RequestParam(required = false) List<SystemFeedbackStatus> statuses) {
        List<SystemFeedbackSummaryResponse> responses = feedbackService.getAllFeedbacks(employeeCode, statuses);
        return ResponseUtil.success(responses, "Lấy danh sách góp ý thành công");
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<SystemFeedbackSummaryResponse>>> searchFeedbacks(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String employeeCode,
            @RequestParam(required = false) List<SystemFeedbackStatus> statuses) {

        List<SystemFeedbackSummaryResponse> responses = feedbackService.searchFeedbacks(keyword, employeeCode,
                statuses);

        return ResponseUtil.success(responses, "Tìm kiếm góp ý thành công");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseUtil.success(null, "Xóa góp ý thành công");
    }

}
