package htmp.codien.quanlycodien.modules.newmodel.plan.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.common.annotation.RequiresPermission;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productMoldTrialPlanIssue.ProductPlanIssueCreationRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productMoldTrialPlanIssue.ProductPlanIssueDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productMoldTrialPlanIssue.ProductPlanIssueResponse;
import htmp.codien.quanlycodien.modules.newmodel.plan.service.productPlanIssue.ProductPlanIssueService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/plan-issues")
@RequiredArgsConstructor
public class ProductPlanIssueController {
    private final ProductPlanIssueService planIssueService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RequiresPermission("NMD_PRODUCT_PLAN_ISSUE_CREATE")
    public ResponseEntity<ApiResponse<Void>> createMoldTrialPlanIssue(
            @RequestParam Long trialPlanId,
            @RequestPart("data") ProductPlanIssueCreationRequest req,
            @RequestPart(value = "beforeFiles", required = false) List<MultipartFile> beforeFiles,
            @RequestPart(value = "afterFiles", required = false) List<MultipartFile> afterFiles,
            @RequestPart(value = "keptOldFiles", required = false) String keptOldFilesJson,
            @RequestPart(value = "deletedOldFiles", required = false) String deletedOldFilesJson) {
        planIssueService.createPlanIssue(trialPlanId, req, beforeFiles, afterFiles, keptOldFilesJson,
                deletedOldFilesJson);
        return ResponseUtil.success(null, "Thêm mới vấn đề phát sinh khi thử khuôn thành công");
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RequiresPermission("NMD_PRODUCT_PLAN_ISSUE_UPDATE")
    public ResponseEntity<ApiResponse<Void>> updateMoldTrialPlanIssue(
            @PathVariable Long id,
            @RequestPart("data") ProductPlanIssueCreationRequest req,
            @RequestPart(value = "beforeFiles", required = false) List<MultipartFile> beforeFiles,
            @RequestPart(value = "afterFiles", required = false) List<MultipartFile> afterFiles,
            @RequestPart(value = "keptOldFiles", required = false) String keptOldFilesJson,
            @RequestPart(value = "deletedOldFiles", required = false) String deletedOldFilesJson) {
        planIssueService.updatePlanIssue(id, req, beforeFiles, afterFiles, keptOldFilesJson, deletedOldFilesJson);
        return ResponseUtil.success(null, "Cập nhật vấn đề phát sinh khi thử khuôn thành công");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<?>>> getAll(
            @RequestParam(required = false) Long planId) {
        if (planId != null) {
            List<ProductPlanIssueResponse> res = planIssueService.getAllIssuesByPlanId(planId);
            return ResponseUtil.success(res, "Lấy danh sách vấn đề phát sinh khi thử khuôn thành công");
        } else {
            List<ProductPlanIssueDTO> res = planIssueService.getAllIssues();
            return ResponseUtil.success(res, "Lấy danh sách vấn đề phát sinh khi thử khuôn thành công");
        }
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("NMD_PRODUCT_PLAN_ISSUE_DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteMoldTrialPlanIssue(@PathVariable Long id) {
        planIssueService.deletePlanIssue(id);
        return ResponseUtil.success(null, "Xoá vấn đề phát sinh khi thử khuôn thành công");
    }

}
