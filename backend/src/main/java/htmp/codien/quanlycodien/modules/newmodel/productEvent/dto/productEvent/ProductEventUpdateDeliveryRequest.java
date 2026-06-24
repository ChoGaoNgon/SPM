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
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductEventUpdateDeliveryRequest {
    LocalDate expectedDeliveryDate;

    LocalDate actualDeliveryDate;

    Integer actualQuantityDelivery;

    HtmpResult feedbackResult;

    String feedbackRemark;
}
