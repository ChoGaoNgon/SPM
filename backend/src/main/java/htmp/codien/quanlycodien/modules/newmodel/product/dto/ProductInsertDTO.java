package htmp.codien.quanlycodien.modules.newmodel.product.dto;

import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductInsertType;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductInsertUnit;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductInsertDTO {
    Long id;
    String code;
    String name;
    Integer quantity;
    String supplier;
    ProductInsertType type;
    ProductInsertUnit unit;
}
