package htmp.codien.quanlycodien.modules.attendance.dto;

import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AttendanceLogDTO {
    Long id;
    String deviceIp;
    Long machineEmployeeId;
    LocalDateTime logTime;
    String employeeCode;
    String employeeName;
    String departmentName;
}
