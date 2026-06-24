package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productMoldTrialPlanIssue;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.IssueType;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductPlanIssueCreationRequest {
    IssueType issueType;
    String issueDescription;
    String cause;
    String improvePlan;
    LocalDateTime repairDeadline;
    Boolean implemented;
    List<ProductPlanIssueDefectCodeDTO> defectCodes;
}
