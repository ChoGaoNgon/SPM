package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan;

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
public class PlanApproveRequest {
    Boolean approvedPlan;
    String remarkApprovedPlan;
}
