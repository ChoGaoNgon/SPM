package htmp.codien.quanlycodien.modules.employee.dto;

import java.time.LocalDate;

import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.modules.employee.enums.EmployeeStatus;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class EmployeeResponse {
    Long id;
    String code;
    String name;
    String phone;
    Role role;
    Long parentDepartmentId;
    String parentDepartmentCode;
    String displayDepartment;
    Long departmentId;
    String departmentCode;
    String departmentName;
    Long positionId;
    String positionName;
    EmployeeStatus status;
    String email;
    String gender;
    LocalDate dateOfBirth;
    LocalDate dateOfJoining;
}