package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MoldTrialPlanUpdateRequestForLOG {
    List<ProductPlanPlasticActualDTO> actualPlastics;
    List<ProductPlanActualSupplyRequest> supplies;
}
