package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan;

import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductPlanScopeType;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductPlanLimitConfigRequest {

    ProductPlanScopeType scopeType;

    Long departmentId;

    TypePlan typePlan;

    Integer maxPlan;
}
