package htmp.codien.quanlycodien.modules.employee.dto;

import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.modules.employee.enums.EmployeeStatus;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class EmployeeRequest {
    Long id;
    String code;
    String name;
    String position;
    String phone;
    Role role;
    Long departmentId;
    Long positionId;
    EmployeeStatus status;
}