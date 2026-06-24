package htmp.codien.quanlycodien.modules.newmodel.plan.service.limitConfig;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import htmp.codien.quanlycodien.modules.department.entity.Department;
import htmp.codien.quanlycodien.modules.department.repository.DepartmentRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanLimitConfigRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanLimitConfigResponse;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanLimitConfig;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanLimitConfigRepository;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductPlanScopeType;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductPlanLimitConfigServiceImpl implements ProductPlanLimitConfigService {

    private final ProductPlanLimitConfigRepository productPlanLimitConfigRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    public void createProductPlanLimitConfigByDepartment() {

        boolean companyExists = productPlanLimitConfigRepository
                .existsByScopeTypeAndDepartmentIdAndTypePlan(
                        ProductPlanScopeType.COMPANY,
                        null,
                        TypePlan.MOLD_TRIAL);

        if (!companyExists) {
            ProductPlanLimitConfig companyConfig = ProductPlanLimitConfig.builder()
                    .scopeType(ProductPlanScopeType.COMPANY)
                    .departmentId(null)
                    .typePlan(TypePlan.MOLD_TRIAL)
                    .maxPlan(18)
                    .build();

            productPlanLimitConfigRepository.save(companyConfig);
        }

        for (Department department : departmentRepository.findByParentDepartmentIsNullOrderByNameAsc()) {

            boolean exists = productPlanLimitConfigRepository
                    .existsByScopeTypeAndDepartmentIdAndTypePlan(
                            ProductPlanScopeType.DEPARTMENT,
                            department.getId(),
                            TypePlan.MOLD_TRIAL);

            if (!exists) {
                ProductPlanLimitConfig departmentConfig = ProductPlanLimitConfig.builder()
                        .scopeType(ProductPlanScopeType.DEPARTMENT)
                        .departmentId(department.getId())
                        .typePlan(TypePlan.MOLD_TRIAL)
                        .maxPlan(6)
                        .build();

                productPlanLimitConfigRepository.save(departmentConfig);
            }

        }
    }

    @Override
    public void updateProductPlanLimitConfig(Long id, ProductPlanLimitConfigRequest request) {
        ProductPlanLimitConfig productPlanLimitConfig = productPlanLimitConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ProductPlanLimitConfig not found with id: " + id));

        productPlanLimitConfig.setScopeType(request.getScopeType());
        productPlanLimitConfig.setDepartmentId(request.getDepartmentId());
        productPlanLimitConfig.setTypePlan(request.getTypePlan());
        productPlanLimitConfig.setMaxPlan(request.getMaxPlan());

        productPlanLimitConfigRepository.save(productPlanLimitConfig);

    }

    @Override
    public void deleteProductPlanLimitConfig(Long id) {
        if (!productPlanLimitConfigRepository.existsById(id)) {
            throw new RuntimeException("ProductPlanLimitConfig not found with id: " + id);
        }
        productPlanLimitConfigRepository.deleteById(id);
    }

    @Override
    public ProductPlanLimitConfigResponse getProductPlanLimitConfigById(Long id) {
        ProductPlanLimitConfig productPlanLimitConfig = productPlanLimitConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ProductPlanLimitConfig not found with id: " + id));

        return ProductPlanLimitConfigResponse.builder()
                .id(productPlanLimitConfig.getId())
                .scopeType(productPlanLimitConfig.getScopeType())
                .departmentId(productPlanLimitConfig.getDepartmentId())
                .typePlan(productPlanLimitConfig.getTypePlan().name())
                .maxPlan(productPlanLimitConfig.getMaxPlan())
                .build();
    }

    @Override
    public List<ProductPlanLimitConfigResponse> getAllProductPlanLimitConfigs() {
        List<ProductPlanLimitConfig> productPlanLimitConfigs = productPlanLimitConfigRepository.findAll();
        return productPlanLimitConfigs.stream()
                .map(config -> ProductPlanLimitConfigResponse.builder()
                        .id(config.getId())
                        .scopeType(config.getScopeType())
                        .departmentId(config.getDepartmentId())
                        .typePlan(config.getTypePlan().name())
                        .maxPlan(config.getMaxPlan())
                        .build())
                .collect(Collectors.toList());
    }

}
