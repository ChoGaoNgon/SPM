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
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlanUpdateRequestTimeRequest {
    Long machineId;
    String requestMachineNote;
    String requestStartTimeNote;
    String requestEndTimeNote;
    LocalDateTime requestStartTime;
    LocalDateTime requestEndTime;
}
