package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan;

import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductPlanDelayLogRespopnse {
    Long id;
    Long planId;
    Long delayDuration;
    String reason;
    String delayTypeDescription;
    String createdBy;
    LocalDateTime createdAt;
}
