package htmp.codien.quanlycodien.modules.workschedule.dto.overtime;

import java.time.LocalDate;

import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.modules.employee.dto.EmployeeResponse;
import htmp.codien.quanlycodien.modules.workschedule.enums.WorkRequestStatus;
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
public class OvertimeApprovalDTO {
    Long id;
    WorkRequestStatus action;
    LocalDate actionDate;
    String comment;
    Role role;
    EmployeeResponse approver;
}
