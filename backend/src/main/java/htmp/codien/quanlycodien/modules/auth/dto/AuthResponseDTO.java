package htmp.codien.quanlycodien.modules.auth.dto;

import java.util.Set;

import htmp.codien.quanlycodien.modules.employee.dto.EmployeeResponse;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthResponseDTO {
    String token;
    EmployeeResponse employee;
    Set<String> permissions;
    Boolean mustChangePassword;
}