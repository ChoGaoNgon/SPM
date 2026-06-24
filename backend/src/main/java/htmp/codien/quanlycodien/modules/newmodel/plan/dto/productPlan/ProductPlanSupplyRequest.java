package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ProductPlanSupplyRequest {
    String code;
    String name;
    Double supplyExpectedQuantity;
    Double supplyActualQuantity;
    String unit;
    String remark;
}
