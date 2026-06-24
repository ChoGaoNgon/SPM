package htmp.codien.quanlycodien.modules.workschedule.dto.schedule;

import java.time.LocalTime;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Data
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShiftDTO {
    Long id;
    String shiftCode;
    String codeHcns;
    String description;
    LocalTime startTime;
    LocalTime endTime;
}