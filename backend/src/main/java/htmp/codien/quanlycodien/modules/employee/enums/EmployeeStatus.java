package htmp.codien.quanlycodien.modules.employee.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum EmployeeStatus {
    PROBATION("Đang thử việc"),
    ACTIVE("Đang làm việc"),
    INACTIVE("Đã nghỉ việc");

    private final String description;
}