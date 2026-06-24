package htmp.codien.quanlycodien.modules.workschedule.dto.schedule;

import java.util.Map;

import lombok.AccessLevel;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeeScheduleRequest {
    Long employeeId;
    Map<String, Long> days;
}