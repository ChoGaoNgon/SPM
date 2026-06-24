package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan;

import htmp.codien.quanlycodien.common.enums.ApprovalStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlanApprovalRequest {
    String approvalType;
    ApprovalStatus status;
    String remark;
}
