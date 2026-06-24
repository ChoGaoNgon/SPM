package htmp.codien.quanlycodien.modules.newmodel.mp.dto.productMpCheckList;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductMpCheckListResponse {
    Long id;
    Long productId;
    String productCode;
    String productName;
    String processName;
    String delayMpReason;
    List<ProductMpCheckItemDto> checkItems;
    List<ProductMpApprovalDto> approvals;
    ProductMpCreatorDto createdBy;
    LocalDateTime createdAt;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProductMpCreatorDto {
        Long id;
        String code;
        String name;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProductMpCheckItemDto {
        Long id;
        String type;
        String name;
        String requestContent;
        String standard;
        Long responsibility1Id;
        String responsibility1Code;
        String responsibility1Name;
        Long responsibility2Id;
        String responsibility2Code;
        String responsibility2Name;
        String resultByResponsibility1;
        String resultByResponsibility2;
        Long assignById;
        String assignByName;
        Long receivedById;
        String receivedByName;
        String finalResult;
        String remark;
        List<ProductMpFileDto> files;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProductMpFileDto {
        Long id;
        String filePath;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProductMpApprovalDto {
        Long id;
        Long departmentId;
        String departmentCode;
        String departmentName;
        Long approvedById;
        String approvedByName;
        String status;
        String comment;
    }
}
