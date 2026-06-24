package htmp.codien.quanlycodien.modules.newmodel.plan.dto;

import java.time.LocalDateTime;

import htmp.codien.quanlycodien.common.enums.ApprovalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductPlanApprovalDTO {
    Long id;
    String approvalType;
    String approvalTypeName;
    Integer approvalOrder;
    ApprovalStatus status;
    Long approvedById;
    String approvedByName;
    String approvedByCode;
    LocalDateTime approvedAt;
    String remark;
    String requiredPermission;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    String createdBy;
    String updatedBy;
}
