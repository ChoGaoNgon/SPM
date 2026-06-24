package htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.productEventRequirement;

import lombok.AccessLevel;
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
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductEventRequirementRequest {
    Long productId;
    String name;
    String deliveryDate;
    Long quantity;
}
