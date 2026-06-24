package htmp.codien.quanlycodien.modules.mold.dto;

import java.util.List;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productMoldTrialPlanIssue.ProductPlanIssueDTO;
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
public class MoldIssueResponse {
    Long moldId;
    Long modelId;
    String modelCode;
    Long productId;
    String productCode;
    Long productPlanId;
    String planName;
    List<ProductPlanIssueDTO> productPlanIssues;

}
