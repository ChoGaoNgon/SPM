package htmp.codien.quanlycodien.modules.workschedule.dto.schedule;

import java.time.LocalTime;

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
public class ShiftBreakDTO {
    Long id;
    String breakType;
    LocalTime startTime;
    LocalTime endTime;
    Integer duration;
    Boolean isPaid;
    Long shiftId;
}