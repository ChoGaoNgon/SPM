package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan;

import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductResinMappingDTO;
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
public class ProductPlanResinResponse {
    Long id;
    ProductResinMappingDTO resin;
    Boolean isRecycle;
    Double plasticExpectedWeight;
    Double plasticActualWeight;
}
