package htmp.codien.quanlycodien.modules.newmodel.statistic.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PlanSummaryDto;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductDTO;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;
import htmp.codien.quanlycodien.modules.newmodel.statistic.dto.NMDCustomerStatisticalResponse;
import htmp.codien.quanlycodien.modules.newmodel.statistic.dto.NMDEventCompanyStatisticsResponse;
import htmp.codien.quanlycodien.modules.newmodel.statistic.dto.NewmodelOverviewStatisticsDetailResponse;
import htmp.codien.quanlycodien.modules.newmodel.statistic.dto.NewmodelOverviewStatisticsPieChartResponse;
import htmp.codien.quanlycodien.modules.newmodel.statistic.service.nmd.NewmodelStatisticsService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/newmodel-statistics")
@RequiredArgsConstructor
public class NewmodelStatisticsController {
    private final NewmodelStatisticsService newmodelStatisticsService;

    @GetMapping("/overview-pie-chart")
    public ResponseEntity<ApiResponse<NewmodelOverviewStatisticsPieChartResponse>> getOverviewPieChartStatistics() {
        NewmodelOverviewStatisticsPieChartResponse response = newmodelStatisticsService.getOverviewPieChartStatistics();
        return ResponseUtil.success(response, "Lấy thống kê tổng quan thành công");
    }

    @GetMapping("/products-pending-approval")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getProductsPendingApproval() {
        List<ProductDTO> response = newmodelStatisticsService.getProductsPendingApproval();
        return ResponseUtil.success(response, "Lấy danh sách sản phẩm đang chờ phê duyệt thành công");
    }

    @GetMapping("/plans-with-null-actual-fa-submit-date")
    public ResponseEntity<ApiResponse<List<PlanSummaryDto>>> getProductPlansWithNullActualFaSubmitDate() {
        List<PlanSummaryDto> response = newmodelStatisticsService.getProductPlansWithNullActualFaSubmitDate();
        return ResponseUtil.success(response, "Lấy danh sách kế hoạch có cần cập nhật ngày gửi FA thực tế thành công");
    }

    @GetMapping("/plan-pending-approval")
    public ResponseEntity<ApiResponse<List<PlanSummaryDto>>> getPlansPendingApproval() {
        List<PlanSummaryDto> response = newmodelStatisticsService.getPlansPendingApproval();
        return ResponseUtil.success(response, "Lấy danh sách kế hoạch đang chờ phê duyệt thành công");
    }

    @GetMapping("/products-by-plan-type")
    public ResponseEntity<ApiResponse<NewmodelOverviewStatisticsDetailResponse>> getProductsByPlanType(
            @RequestParam("planType") String planTypeStr) {
        try {
            TypePlan planType = TypePlan.valueOf(planTypeStr.toUpperCase());
            NewmodelOverviewStatisticsDetailResponse response = newmodelStatisticsService
                    .getProductsByPlanType(planType);
            return ResponseUtil.success(response, "Lấy danh sách sản phẩm theo kế hoạch thành công");
        } catch (IllegalArgumentException e) {
            return ResponseUtil.badRequest("Loại kế hoạch không hợp lệ: " + planTypeStr
                    + ". Các giá trị hợp lệ: MOLD_TRIAL, EVENT, SECOND_PROCESS");
        }
    }

    @GetMapping("/customer-plan-statistics")
    public ResponseEntity<ApiResponse<NMDCustomerStatisticalResponse>> getCustomerPlanStatistics(
            @RequestParam(defaultValue = "10") Integer limit) {

        NMDCustomerStatisticalResponse response = newmodelStatisticsService.getCustomerPlanStatistics(limit);
        return ResponseUtil.success(response, "Lấy thống kê kế hoạch theo khách hàng thành công");
    }

    @GetMapping("/event-status-statistics")

    public ResponseEntity<ApiResponse<NMDEventCompanyStatisticsResponse>> getEventStatisticsByStatus(
            @RequestParam(defaultValue = "EVENT") TypePlan planType) {
        NMDEventCompanyStatisticsResponse response = newmodelStatisticsService.getEventStatisticsByStatus(planType);
        return ResponseUtil.success(response, "Lấy thống kê theo trạng thái thành công");
    }
}