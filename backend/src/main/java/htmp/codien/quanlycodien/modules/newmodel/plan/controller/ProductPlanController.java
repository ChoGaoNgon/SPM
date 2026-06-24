package htmp.codien.quanlycodien.modules.newmodel.plan.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.common.annotation.RequiresPermission;
import htmp.codien.quanlycodien.common.annotation.RequiresPermission.Logical;
import htmp.codien.quanlycodien.common.enums.HtmpStatus;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.HtmpStatusResponse;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.MoldTrialPlanUpdateRequestForKT;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.MoldTrialPlanUpdateRequestForLOG;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.MoldTrialWeeklyStatisticsResponse;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PlanApprovalRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PlanCreationRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PlanResponse;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PlanUpdateRequestTimeRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanApproveResultBatchRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanApproveResultDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanApproveResultRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.sendMail.SendMoldTrialPlanMailRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.service.ProductPlanApproveResultService;
import htmp.codien.quanlycodien.modules.newmodel.plan.service.ProductPlanService;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.MoldTrialPlanListView;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductPlanController {
    private final ProductPlanService productPlanService;
    private final ProductPlanApproveResultService approveResultService;

    @PostMapping("/{productId}/plans")
    @RequiresPermission("NMD_PRODUCT_PLAN_CREATE")
    public ResponseEntity<ApiResponse<Void>> createPlan(
            @PathVariable Long productId,
            @RequestBody PlanCreationRequest req,
            @RequestParam(required = true) String typePlan) {

        TypePlan typePlanEnum = TypePlan.valueOf(typePlan);
        productPlanService.createPlan(productId, req, typePlanEnum);
        return ResponseUtil.success(null, "Thêm mới kế hoạch thành công");
    }

    @PutMapping("/plans/{id}")
    @RequiresPermission("NMD_PRODUCT_PLAN_UPDATE")
    public ResponseEntity<ApiResponse<Void>> updatePlan(@PathVariable Long id,
            @RequestBody PlanCreationRequest req) {
        productPlanService.updatePlan(id, req);
        return ResponseUtil.success(null, "Cập nhật kế hoạch thành công");
    }

    @GetMapping("/{productId}/plans")
    public ResponseEntity<ApiResponse<List<PlanResponse>>> getAllPlanByProductId(
            @PathVariable Long productId) {
        List<PlanResponse> moldTrialPlan = productPlanService.getAllPlanByProductId(productId);
        return ResponseUtil.success(moldTrialPlan,
                "Lấy danh sách kế hoạch cho sản phẩm " + productId + " thành công");

    }

    @GetMapping("/plans/{id}")
    public ResponseEntity<ApiResponse<PlanResponse>> getPlanById(@PathVariable Long id) {
        PlanResponse moldTrialPlan = productPlanService.getPlanById(id);
        return ResponseUtil.success(moldTrialPlan, "Lấy kế hoạch thành công");
    }

    @GetMapping("/plans/{planId}/delay-logs/count")
    public ResponseEntity<ApiResponse<Long>> countDelayLogsByPlanId(@PathVariable Long planId) {
        long totalDelayLogs = productPlanService.countDelayLogsByPlanId(planId);
        return ResponseUtil.success(totalDelayLogs, "Lấy số lượng log trễ thành công");
    }

    @RequiresPermission("NMD_PRODUCT_PLAN_ACTUAL_UPDATE")
    @PutMapping("/plans/{id}/kt")
    public ResponseEntity<ApiResponse<Void>> updateMoldTrialPlanForKT(@PathVariable Long id,
            @RequestBody MoldTrialPlanUpdateRequestForKT req) {
        productPlanService.updateActualMoldTrialPlanForKT(id, req);
        return ResponseUtil.success(null, "Cập nhật kế hoạch thành công");
    }

    @RequiresPermission("NMD_PRODUCT_PLAN_MASTERIAL_UPDATE")
    @PutMapping("/plans/{id}/log")
    public ResponseEntity<ApiResponse<Void>> updateMoldTrialPlanForLOG(@PathVariable Long id,
            @RequestBody MoldTrialPlanUpdateRequestForLOG req) {
        productPlanService.updateActualMoldTrialPlanForLOG(id, req);
        return ResponseUtil.success(null, "Cập nhật kế hoạch thành công");
    }

    @DeleteMapping("/plans/{id}")
    @RequiresPermission(logical = Logical.OR, value = { "NMD_PRODUCT_PLAN_DELETE",
            "NMD_PRODUCT_PLAN_DELETE_NOT_APPROVED" })
    public ResponseEntity<ApiResponse<Void>> deleteMoldTrialPlan(@PathVariable Long id) {
        productPlanService.deleteProductMoldTrialPlan(id);
        return ResponseUtil.success(null, "Xóa kế hoạch thành công");
    }

    @GetMapping("/plans/by-htmp-resin")
    public ResponseEntity<ApiResponse<PlanResponse>> getLatestMoldTrialPlanByHtmpResin(
            @RequestParam String htmpResin) {
        PlanResponse response = productPlanService.getLatestMoldTrialPlanByHtmpResin(htmpResin);
        return ResponseUtil.success(response, "Lấy thông tin kế hoạch mới nhất theo HTMP Resin thành công");
    }

    @GetMapping("/plans/dryer-list")
    public ResponseEntity<ApiResponse<List<String>>> getAllDistinctDryer() {
        List<String> dryerList = productPlanService.getAllDistinctDryer();
        return ResponseUtil.success(dryerList, "Lấy danh sách máy sấy thành công");
    }

    @GetMapping("/plans/progress-step-list")
    public ResponseEntity<ApiResponse<List<String>>> getAllDistinctProcessStep() {
        List<String> processStepList = productPlanService.getAllDistinctProcessStep();
        return ResponseUtil.success(processStepList, "Lấy danh sách tiến trình thành công");
    }

    @PatchMapping("/plans/{id}/approval")

    public ResponseEntity<ApiResponse<Void>> approveProductPlanApproval(@PathVariable Long id,
            @RequestBody PlanApprovalRequest req) {
        productPlanService.approveProductPlanApproval(id, req);
        return ResponseUtil.success(null, "Phê duyệt thành công");
    }

    @PatchMapping("/plans/{id}/result")
    public ResponseEntity<ApiResponse<Void>> updateMoldTrialPlanResult(@PathVariable Long id,
            @RequestParam(required = false) Boolean resultedByKT,
            @RequestParam(required = false) Boolean resultedByMold,
            @RequestParam(required = false) Boolean resultedByNMD,
            @RequestParam(required = false) Boolean resultedByQC,
            @RequestParam(required = false) Boolean resultedBySX) {
        productPlanService.updateMoldTrialPlanApproveResult(id, resultedByKT, resultedByMold, resultedByNMD,
                resultedByQC, resultedBySX);
        return ResponseUtil.success(null, "Cập nhật kết quả thành công");
    }

    @GetMapping("/plans/{planId}/approve-results")
    public ResponseEntity<ApiResponse<List<ProductPlanApproveResultDTO>>> getApproveResults(
            @PathVariable Long planId) {
        List<ProductPlanApproveResultDTO> results = approveResultService
                .getApproveResultsByPlanId(planId);
        return ResponseUtil.success(results, "Lấy danh sách kết quả phê duyệt thành công");
    }

    @PutMapping(value = "/plans/{planId}/cancel")
    @RequiresPermission("NMD_PRODUCT_PLAN_CANCEL")
    public ResponseEntity<ApiResponse<Void>> cancelPlan(
            @PathVariable Long planId,
            @RequestBody PlanCreationRequest req) {
        productPlanService.cancelPlan(planId, req);
        return ResponseUtil.success(null, "Hủy kế hoạch thành công");
    }

    @PutMapping("/plans/{planId}/approve-results/{departmentCode}")

    public ResponseEntity<ApiResponse<ProductPlanApproveResultDTO>> updateApproveResult(
            @PathVariable Long planId,
            @PathVariable String departmentCode,
            @RequestBody ProductPlanApproveResultRequest request) {
        ProductPlanApproveResultDTO result = approveResultService.updateApproveResult(planId,
                departmentCode, request);
        return ResponseUtil.success(result, "Cập nhật kết quả phê duyệt thành công");
    }

    @PutMapping("/plans/{planId}/approve-results/batch")

    public ResponseEntity<ApiResponse<Void>> batchUpdateApproveResults(
            @PathVariable Long planId,
            @RequestBody ProductPlanApproveResultBatchRequest batchRequest) {
        approveResultService.batchUpdateApproveResults(planId, batchRequest);
        return ResponseUtil.success(null, "Cập nhật kết quả phê duyệt hàng loạt thành công");
    }

    @DeleteMapping("/plans/{planId}/approve-results/{departmentCode}")

    public ResponseEntity<ApiResponse<Void>> deleteApproveResult(
            @PathVariable Long planId,
            @PathVariable String departmentCode) {
        approveResultService.deleteApproveResult(planId, departmentCode);
        return ResponseUtil.success(null, "Xóa kết quả phê duyệt thành công");
    }

    @PostMapping("/plans/send-mail")
    public ResponseEntity<ApiResponse<Void>> sendMoldTrialPlanMail(@RequestBody SendMoldTrialPlanMailRequest request) {
        productPlanService.sendMoldTrialPlanMail(request);
        return ResponseUtil.success(null, "Gửi email kế hoạch thành công");
    }

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<MoldTrialPlanListView>>> search(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) TypePlan typePlan) {

        LocalDateTime effectiveFromDate = fromDate;
        LocalDateTime effectiveToDate = toDate;
        if (date != null) {
            effectiveFromDate = date.atStartOfDay();
            effectiveToDate = date.plusDays(1).atStartOfDay();
        }

        return ResponseUtil.success(
                productPlanService.searchMoldTrialPlans(effectiveFromDate, effectiveToDate, typePlan),
                "Lấy danh sách kế hoạch thành công");
    }

    @GetMapping("/plans/statuses")
    public ResponseEntity<ApiResponse<List<HtmpStatusResponse>>> getAllPlanStatuses() {
        List<HtmpStatusResponse> statuses = Arrays.stream(HtmpStatus.values())
                .map(status -> new HtmpStatusResponse(status.name(), status.getDescription(), status.getColor()))
                .collect(Collectors.toList());

        return ResponseUtil.success(statuses, "Lấy danh sách trạng thái kế hoạch thành công");
    }

    @PatchMapping("/plans/{planId}/request-time")
    @RequiresPermission("NMD_PRODUCT_PLAN_REQUEST_TIME_UPDATE")
    public ResponseEntity<ApiResponse<Void>> updateRequestTime(
            @PathVariable Long planId,
            @RequestBody PlanUpdateRequestTimeRequest request) {
        productPlanService.updateRequestTime(planId, request);
        return ResponseUtil.success(null, "Cập nhật thời gian yêu cầu thành công");
    }

    @GetMapping("/plans/mold-trial-statistics")
    public ResponseEntity<ApiResponse<MoldTrialWeeklyStatisticsResponse>> getMoldTrialWeeklyStatistics(
            @RequestParam(defaultValue = "WEEK") String periodType,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer week) {
        MoldTrialWeeklyStatisticsResponse response = productPlanService.getMoldTrialWeeklyStatistics(periodType, year,
                month, week);
        return ResponseUtil.success(response, "Lấy thống kê khuôn thử trong tuần thành công");
    }
}
