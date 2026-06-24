package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productMoldTrialPlanIssue;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Set;

import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.IssueType;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductPlanIssueDTO {
    Long id;
    String productCode;
    String planName;
    IssueType issueType;
    String issueDescription;
    String cause;
    String improvePlan;
    LocalDateTime repairDeadline;
    Boolean implemented;
    LocalDateTime createdAt;
    Set<ProductPlanIssueFileResponse> files;
    Set<ProductPlanIssueDefectCodeDTO> defectCodes;
}