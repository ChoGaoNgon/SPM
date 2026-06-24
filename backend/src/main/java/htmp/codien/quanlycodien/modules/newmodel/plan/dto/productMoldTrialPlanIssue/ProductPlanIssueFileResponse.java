package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productMoldTrialPlanIssue;

import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.IssueStatus;
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
public class ProductPlanIssueFileResponse {
    Long id;
    String filePath;
    IssueStatus status;
    String remark;
}
