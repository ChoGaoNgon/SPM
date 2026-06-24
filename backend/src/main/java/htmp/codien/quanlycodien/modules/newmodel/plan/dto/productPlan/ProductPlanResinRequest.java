package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan;

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
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ProductPlanResinRequest {
    String resinCode;

    Boolean isRecycle;

    String remark;

    Double plasticExpectedWeight;
}
