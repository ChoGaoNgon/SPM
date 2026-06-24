package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductPlanApprovalTemplateRequest {

    String approvalType;

    String approvalTypeName;

    Integer approvalOrder;

    Boolean required;

    String requiredPermission;
}
