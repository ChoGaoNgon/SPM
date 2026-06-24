package htmp.codien.quanlycodien.modules.newmodel.product.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ProductHistoryResponse {
    String fieldName;
    String oldValue;
    String newValue;
    LocalDateTime createdAt;
    String createdByCode;
    String createdByName;
}
