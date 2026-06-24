package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan;

import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductPlanScopeType;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductPlanLimitConfigResponse {

    Long id;

    ProductPlanScopeType scopeType;

    Long departmentId;

    String typePlan;

    Integer maxPlan;
}
