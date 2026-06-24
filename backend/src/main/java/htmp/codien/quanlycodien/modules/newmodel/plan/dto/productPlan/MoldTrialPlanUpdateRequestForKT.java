package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan;

import java.time.LocalDateTime;

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
public class MoldTrialPlanUpdateRequestForKT {
    Long id;
    LocalDateTime actualStartTime;
    LocalDateTime actualEndTime;
    LocalDateTime productSampleSubmitDate;
    Long productSampleSubmitterId;
    String dryingTemperatureActual;
    String dryingTimeActual;
    String planDelayReason;
    String faSubmitDelayReason;
}
