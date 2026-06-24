package htmp.codien.quanlycodien.modules.newmodel.plan.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductPlanApprovalTemplateDTO {

    Long id;

    String approvalType;

    String approvalTypeName;

    Integer approvalOrder;

    Boolean required;
    String requiredPermission;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    String createdBy;

    String updatedBy;
}
