package htmp.codien.quanlycodien.modules.newmodel.product.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductResinDTO {
    Long id;
    Long productId;
    String resinCode;
    Double percentage;
    String remark;
    String type;
    String colorName;
    String grade;
    String description;
}
