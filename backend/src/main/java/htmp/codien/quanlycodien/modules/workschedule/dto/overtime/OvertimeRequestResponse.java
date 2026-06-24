package htmp.codien.quanlycodien.modules.workschedule.dto.overtime;

import java.time.LocalDate;
import java.time.LocalDateTime;

import htmp.codien.quanlycodien.modules.employee.dto.EmployeeResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OvertimeRequestResponse {
    Long id;
    LocalDate workDate;
    LocalDateTime startTime;
    LocalDateTime endTime;
    String reason;
    String status;
    EmployeeResponse employee;
}