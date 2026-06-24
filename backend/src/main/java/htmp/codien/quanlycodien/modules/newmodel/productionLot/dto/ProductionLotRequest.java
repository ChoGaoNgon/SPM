package htmp.codien.quanlycodien.modules.newmodel.productionLot.dto;

import java.time.LocalDate;
import java.util.List;

import htmp.codien.quanlycodien.common.enums.HtmpResult;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductionLotRequest {
    Integer quantity;
    LocalDate productionDate;
    HtmpResult qcCheckResult;
    Long checkedById;
    List<ProductionLotDefectRequest> defectDetails;
    Long productPlanId;
}