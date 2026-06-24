package htmp.codien.quanlycodien.modules.newmodel.product.dto;

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
public class ProductMaterialDTO {
    Long id;
    Long productId;
    Double recyclingRate;
    Boolean isQuotation;
    String matType;
    String matGrade;
    String matColorCode;
    String matColorName;
    String matMaker;
    Integer matMoq;
    String remark;
}
