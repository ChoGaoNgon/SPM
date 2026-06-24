package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productFaInspection;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import htmp.codien.quanlycodien.common.enums.HtmpResult;
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
public class ProductInspectionResponse {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DefectCodeInfo {
        Long id;
        String code;
        String description;
    }

    Long id;
    Long trialPlanId;
    String machineCode;
    LocalDate inspectionDate;
    Integer inspectedQuantity;
    Integer ngQuantity;
    Double ngRate;
    LocalDateTime receivedDate;
    HtmpResult visualResult;
    Long visualCheckedById;
    String visualCheckedByCode;
    String visualCheckedByName;
    HtmpResult dimensionResult;
    Long dimensionCheckedById;
    String dimensionCheckedByCode;
    String dimensionCheckedByName;
    Long receivedByEmployeeId;
    String receivedByEmployeeCode;
    String receivedByEmployeeName;
    HtmpResult finalResult;
    Long finalCheckedById;
    String finalCheckedByCode;
    String finalCheckedByName;
    HtmpResult factoryResult;
    Long factoryCheckedById;
    String factoryCheckedByCode;
    String factoryCheckedByName;
    String filePath;
    String qcNote;
    LocalDateTime inspectionDeadline;
    String delayReason;
    List<DefectCodeInfo> defectCodes;
    List<ProductInspectionDefectDetailDTO> visualDefectDetails;
    List<ProductInspectionDefectDetailDTO> dimensionDefectDetails;

}
