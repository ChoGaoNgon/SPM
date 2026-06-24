package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productDelivery;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
public class ProductDeliveryDTO {
    LocalDate deliveryDate;
    Integer deliveryQuantity;
    String deliveryNote;
    LocalDate feedbackDate;
    String feedbackComment;
    HtmpResult feedbackResult;
    HtmpResult conditionFileApprovalResult;
    String conditionFileApprovedBy;
    LocalDateTime conditionFileApprovedAt;
    String conditionFileApprovalNote;

}
