package htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.productEventQcCheck;

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
public class ProductEventQcCheckRequest {
    LocalDate qcDate;
    Integer inspectedQuantity;
    HtmpResult visualResult;
    Long visualCheckedById;
    Integer ngQuantity;
    HtmpResult dimensionResult;
    Long dimensionCheckById;
    String issueDescription;
}
