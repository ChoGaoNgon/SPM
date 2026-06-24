package htmp.codien.quanlycodien.modules.newmodel.plan.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanLimitConfigRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanLimitConfigResponse;
import htmp.codien.quanlycodien.modules.newmodel.plan.service.limitConfig.ProductPlanLimitConfigService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/product-plan-limit-configs")
@RequiredArgsConstructor
public class ProductPlanLimitConfigController {
    private final ProductPlanLimitConfigService productPlanLimitConfigService;

    @PostMapping()
    public ResponseEntity<ApiResponse<Void>> createProductPlanLimitConfigByDepartment() {
        productPlanLimitConfigService.createProductPlanLimitConfigByDepartment();
        return ResponseUtil.success(null, "Tạo giới hạn theo các phòng ban thành công");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updateProductPlanLimitConfig(
            @PathVariable Long id, @RequestBody ProductPlanLimitConfigRequest request) {
        productPlanLimitConfigService.updateProductPlanLimitConfig(id, request);
        return ResponseUtil.success(null, "Cập nhật giới hạn theo các phòng ban thành công");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductPlanLimitConfigResponse>> getProductPlanLimitConfigById(
            @PathVariable Long id) {
        ProductPlanLimitConfigResponse response = productPlanLimitConfigService.getProductPlanLimitConfigById(id);
        return ResponseUtil.success(response, "Lấy thông tin giới hạn theo các phòng ban thành công");
    }

    @GetMapping()
    public ResponseEntity<ApiResponse<List<ProductPlanLimitConfigResponse>>> getAllProductPlanLimitConfigs() {
        List<ProductPlanLimitConfigResponse> responses = productPlanLimitConfigService.getAllProductPlanLimitConfigs();
        return ResponseUtil.success(responses, "Lấy danh sách giới hạn theo các phòng ban thành công");
    }
}
