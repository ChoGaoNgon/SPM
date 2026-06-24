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
public class ProductDeliveryResponse {
    Long id;
    LocalDate deliveryDate;
    Integer deliveryQuantity;
    String deliveryNote;
    LocalDate feedbackDate;
    String feedbackComment;
    String feedbackFileUrl;
    HtmpResult feedbackResult;
    String conditionFileUrl;
    HtmpResult conditionFileApprovalResult;
    String conditionFileApprovedBy;
    LocalDateTime conditionFileApprovedAt;
    String conditionFileApprovalNote;

}
