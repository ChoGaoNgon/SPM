package htmp.codien.quanlycodien.modules.newmodel.plan.service.limitConfig;

import java.util.List;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanLimitConfigRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanLimitConfigResponse;

public interface ProductPlanLimitConfigService {
    void createProductPlanLimitConfigByDepartment();

    void updateProductPlanLimitConfig(Long id, ProductPlanLimitConfigRequest request);

    void deleteProductPlanLimitConfig(Long id);

    ProductPlanLimitConfigResponse getProductPlanLimitConfigById(Long id);

    List<ProductPlanLimitConfigResponse> getAllProductPlanLimitConfigs();
}
