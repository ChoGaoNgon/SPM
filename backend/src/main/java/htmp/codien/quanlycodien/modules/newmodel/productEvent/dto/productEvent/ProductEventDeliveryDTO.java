package htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.productEvent;

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
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductEventDeliveryDTO {
    LocalDate expectedDeliveryDate;
    LocalDate actualDeliveryDate;
    Integer actualQuantityDelivery;
    String feedbackRemark;
    HtmpResult feedbackResult;
}
