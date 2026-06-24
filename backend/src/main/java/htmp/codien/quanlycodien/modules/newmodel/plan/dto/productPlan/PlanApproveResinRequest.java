package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan;

import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ApproveResinStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlanApproveResinRequest {
    ApproveResinStatus approvedResin;
    String remarkApprovedResin;
}
