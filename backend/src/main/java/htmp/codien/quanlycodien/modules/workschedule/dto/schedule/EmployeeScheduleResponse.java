package htmp.codien.quanlycodien.modules.workschedule.dto.schedule;

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
public class EmployeeScheduleResponse {
    Long employeeId;
    String employeeName;
    String employeeCode;
    Map<String, String> days;
}