package htmp.codien.quanlycodien.modules.newmodel.product.dto;

import htmp.codien.quanlycodien.modules.newmodel.product.enums.ProductStatus;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductCategory;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductNmdInfoStatus;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ProductShortResponse {
    Long id;
    String code;
    String name;
    Long modelId;
    String modelCode;
    String moldCode;
    ProductCategory productCategory;
    String categoryName;
    String categoryColor;
    ProductStatus status;
    LocalDate infoReceivedDate;
    ProductNmdInfoStatus nmdInfoStatus;
    String nmdInfoNote;
    String remark;
    String fileUrl;
    String customerName;
    Boolean isApprovedByHeadKD;
    String mpDelayReason;
}
