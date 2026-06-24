package htmp.codien.quanlycodien.modules.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class EmployeeStatusResponse {
    private String code;
    private String description;
}