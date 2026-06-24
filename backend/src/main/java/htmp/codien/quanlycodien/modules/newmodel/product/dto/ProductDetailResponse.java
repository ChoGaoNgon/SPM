package htmp.codien.quanlycodien.modules.newmodel.product.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productMoldTrialPlanIssue.ProductPlanIssueFileResponse;
import htmp.codien.quanlycodien.modules.newmodel.product.enums.ProductStatus;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.productEventRequirement.ProductEventRequirementRequest;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductCategory;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductMarketType;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductNmdInfoStatus;
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
public class ProductDetailResponse {
    Long id;
    String code;
    String name;
    Long moldId;
    String moldCode;
    String moldType;

    Integer lifecycleYear;
    Integer monthlyOutput;
    Integer moq;
    Integer mdq;
    ProductCategory productCategory;
    String categoryName;
    String categoryColor;
    LocalDate infoReceivedDate;
    ProductNmdInfoStatus nmdInfoStatus;
    String nmdInfoNote;
    String mpTargetDate;
    ProductStatus status;
    String remark;
    String fileUrl;
    String gateType;
    String image;
    String createdByCode;
    String createdByName;
    String createdByDepartmentCode;
    String createdByDepartmentName;
    List<ProductResinMappingDTO> ProductResinMappings;
    ProductMarketType marketType;
    Boolean isApprovedByHeadKD;

    List<ProductMaterialDTO> productMaterials;
    ProductMachineDTO productMachine;
    ProductPackingDTO productPacking;
    ProductMoldDepreciationDTO productMoldDepreciation;
    List<ProductInsertDTO> productInserts;
    List<ProductEventRequirementRequest> productEventRequirements;
    Set<ProductPlanIssueFileResponse> files;

    List<ProductHistorySummaryResponse> historySummary;
    List<ProductHistoryResponse> historyDetails;
}
