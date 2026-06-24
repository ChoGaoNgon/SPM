package htmp.codien.quanlycodien.modules.workschedule.dto.schedule;

import java.time.LocalDateTime;
import java.util.Map;

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
public class MyScheduleResponse {
    Long employeeId;
    String employeeName;
    String employeeCode;
    Map<String, DayAttendance> workSchedules;
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public class DayAttendance {
        String shift;
        LocalDateTime checkInTime;
        LocalDateTime checkOutTime;
        Boolean isLate;
        Boolean isEarly;
    }
}