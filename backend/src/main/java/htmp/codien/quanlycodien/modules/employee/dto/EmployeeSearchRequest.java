package htmp.codien.quanlycodien.modules.employee.dto;

import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.modules.employee.enums.EmployeeStatus;
import htmp.codien.quanlycodien.modules.employee.enums.EmployeeType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeeSearchRequest {
    String keyword;
    String code;
    String name;
    String phone;
    Role role;
    EmployeeType employeeType;
    Long departmentId;
    Long positionId;
    EmployeeStatus status;
    List<Long> departmentIds;
    List<Long> positionIds;
    Boolean withDepartment;
    Boolean withPosition;
}
