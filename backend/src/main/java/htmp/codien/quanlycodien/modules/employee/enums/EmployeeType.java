package htmp.codien.quanlycodien.modules.employee.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum EmployeeType {
    DIRECT("Khối trực tiếp"),
    INDIRECT("Khối gián tiếp");

    private final String displayName;
}