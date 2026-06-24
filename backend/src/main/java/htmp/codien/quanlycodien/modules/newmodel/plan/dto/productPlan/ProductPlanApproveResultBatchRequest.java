package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductPlanApproveResultBatchRequest {

    List<ProductPlanApproveResultRequest> approveResults;
}