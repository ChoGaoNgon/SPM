package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class PlanSummaryDto {
    Long id;
    Long modelId;
    Long productId;
    String name;
    String typePlanDescription;
    String productCode;
    String modelCode;
    String createdBy;
    String status;
    String statusDescription;
    String statusColor;
}
