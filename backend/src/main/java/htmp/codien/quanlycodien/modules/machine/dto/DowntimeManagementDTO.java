package htmp.codien.quanlycodien.modules.machine.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class DowntimeManagementDTO {
    Long id;
    String machineId;
    Boolean runState;
    Boolean errorState;
    Boolean stopState;
    LocalDateTime startTime;
    LocalDateTime endTime;
    Integer durationMinutes;
}