package htmp.codien.quanlycodien.modules.workschedule.dto.shiftChange;

import java.time.LocalDate;

import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.modules.employee.dto.EmployeeResponse;
import htmp.codien.quanlycodien.modules.workschedule.enums.WorkRequestStatus;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShiftChangeApprovalDTO {
    Long id;
    WorkRequestStatus action;
    LocalDate actionDate;
    String comment;
    Role role;
    EmployeeResponse approver;
}