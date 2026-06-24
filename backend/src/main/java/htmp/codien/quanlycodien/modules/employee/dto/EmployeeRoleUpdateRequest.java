package htmp.codien.quanlycodien.modules.employee.dto;

import htmp.codien.quanlycodien.common.enums.Role;
import lombok.Data;

@Data
public class EmployeeRoleUpdateRequest {
    private Role role;
}
