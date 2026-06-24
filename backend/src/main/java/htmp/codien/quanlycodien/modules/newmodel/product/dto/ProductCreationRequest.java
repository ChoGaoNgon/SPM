package htmp.codien.quanlycodien.modules.newmodel.product.dto;

import java.time.LocalDate;
import java.util.List;

import htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.productEventRequirement.ProductEventRequirementRequest;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductCategory;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductMarketType;
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
public class ProductCreationRequest {
    String code;
    String name;
    Long modelId;
    String moldCode;
    Integer lifecycleYear;
    Integer monthlyOutput;
    Integer moq;
    Integer mdq;
    ProductCategory productCategory;
    LocalDate infoReceivedDate;
    LocalDate mpTargetDate;
    String productRemark;
    Boolean fileChanged;
    List<String> resinCodes;

    ProductMarketType marketType;
    ProductMachineDTO productMachine;
    List<ProductMaterialDTO> productMaterials;
    ProductPackingDTO productPacking;
    List<ProductInsertDTO> productInserts;
    List<ProductEventRequirementRequest> productEventRequirements;
    ProductMoldDepreciationDTO productMoldDepreciation;
}
