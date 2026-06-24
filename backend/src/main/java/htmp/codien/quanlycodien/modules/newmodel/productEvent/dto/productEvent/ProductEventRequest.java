package htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.productEvent;

import java.time.LocalDateTime;

import htmp.codien.quanlycodien.common.enums.HtmpResult;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;
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
public class ProductEventRequest {
    LocalDateTime requestStartTime;
    LocalDateTime requestEndTime;
    LocalDateTime actualStartTime;
    LocalDateTime actualEndTime;
    String name;
    @Builder.Default
    TypePlan typePlan = TypePlan.EVENT;
    Integer sampleQuantity;
    String remark;
    HtmpResult feedbackResult;
    String feedbackRemark;

}
