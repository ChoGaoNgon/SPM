package htmp.codien.quanlycodien.modules.workschedule.dto.shiftChange;

import htmp.codien.quanlycodien.modules.employee.dto.EmployeeResponse;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.ShiftDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShiftChangeRequestDTO {
    Long id;
    String workDate;
    String reason;
    String status;
    ShiftDTO currentShift;
    ShiftDTO requestedShift;
    EmployeeResponse employee;
}