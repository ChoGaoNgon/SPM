package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan;

import java.time.LocalDateTime;

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
public class ProductPlanRequest {
    String approvalType;
    String approvalTypeName;
    Integer approvalOrder;
    ApprovalStatus status;
    Long approvedById;
    String remark;
    LocalDateTime approvedAt;
}
