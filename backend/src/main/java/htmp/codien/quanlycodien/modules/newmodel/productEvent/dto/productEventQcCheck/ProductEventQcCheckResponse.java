package htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.productEventQcCheck;

import java.math.BigDecimal;
import java.time.LocalDate;

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
public class ProductEventQcCheckResponse {
    Long id;
    Long eventId;
    LocalDate qcDate;
    Integer inspectedQuantity;
    Integer ngQuantity;
    BigDecimal ngRatio;
    HtmpResult visualResult;
    Long visualCheckedById;
    String visualCheckedByCode;
    String visualCheckedByName;
    HtmpResult dimensionResult;
    Long dimensionCheckById;
    String dimensionCheckedByCode;
    String dimensionCheckedByName;
    String issueDescription;
    Boolean allowShipment;

}
