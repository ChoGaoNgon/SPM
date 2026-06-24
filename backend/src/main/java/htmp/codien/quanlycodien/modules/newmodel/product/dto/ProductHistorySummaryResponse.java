package htmp.codien.quanlycodien.modules.newmodel.product.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ProductHistorySummaryResponse {
    String fieldName;
    Integer count;
}
