package htmp.codien.quanlycodien.modules.workschedule.dto.schedule;

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
public class ShiftPatternDTO {
    Long id;
    String code;
    String name;
    String pattern;
    String defaultShift;
    Boolean isActive;
    Integer displayOrder;
}
