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
public class ProductInspectionDTO {
    String machineCode;
    LocalDate inspectionDate;
    LocalDateTime inspectionDeadline;
    Integer inspectedQuantity;
    Integer ngQuantity;
    LocalDateTime receivedDate;
    String delayReason;
    HtmpResult visualResult;
    Long visualCheckedById;
    HtmpResult dimensionResult;
    Long dimensionCheckedById;
    Long receivedByEmployeeId;
    HtmpResult finalResult;
    Long finalCheckedById;
    HtmpResult factoryResult;
    Long factoryCheckedById;
    List<ProductInspectionDefectDetailDTO> visualDefectDetails;
    List<ProductInspectionDefectDetailDTO> dimensionDefectDetails;
    String qcNote;
}
