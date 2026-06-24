package htmp.codien.quanlycodien.modules.workschedule.dto.overtime;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class OvertimeRequestDTO {
    Long employeeId;
    LocalDateTime startTime;
    LocalDateTime endTime;
    String taskDescription;
}
