package htmp.codien.quanlycodien.modules.newmodel.plan.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanDelayLogRespopnse;
import htmp.codien.quanlycodien.modules.newmodel.plan.service.productPlanDelayLog.ProductPlanDelayLogService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/product-plan-delay-logs")
@RequiredArgsConstructor
public class ProductPlanDelayLogController {
    private final ProductPlanDelayLogService productPlanDelayLogService;

    @GetMapping("/delay-logs/{planId}")
    public ResponseEntity<ApiResponse<List<ProductPlanDelayLogRespopnse>>> getDelayLogsByPlanId(
            @PathVariable Long planId) {
        List<ProductPlanDelayLogRespopnse> delayLogs = productPlanDelayLogService.getDelayLogsByPlanId(planId);
        return ResponseUtil.success(delayLogs, "Danh sách log trễ kế hoạch sản xuất đã được lấy thành công");
    }

}
