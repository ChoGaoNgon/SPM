package htmp.codien.quanlycodien.modules.newmodel.plan.entity;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductPlanScopeType;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "product_plan_limit_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductPlanLimitConfig extends BaseEntity {

    @Enumerated(EnumType.STRING)
    ProductPlanScopeType scopeType;

    Long departmentId;

    @Enumerated(EnumType.STRING)
    TypePlan typePlan;

    Integer maxPlan;

}
