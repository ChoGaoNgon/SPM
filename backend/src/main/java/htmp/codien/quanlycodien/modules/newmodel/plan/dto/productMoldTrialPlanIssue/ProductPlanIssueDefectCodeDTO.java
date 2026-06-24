package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productMoldTrialPlanIssue;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductPlanIssueDefectCodeDTO {
    Long id;
    Long defectCodeId;
    String defectCode;
    String defectCodeDescription;
    Integer quantity;
    String note;
}
