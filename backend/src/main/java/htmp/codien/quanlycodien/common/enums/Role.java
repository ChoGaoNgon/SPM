package htmp.codien.quanlycodien.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Role {
    SUPERADMIN("Quản trị hệ thống"),
    DIRECTOR("Giám đốc"),
    HEAD("Trưởng phòng"),
    HR("Nhân sự"),
    MANAGER("Quản lý"),
    EMPLOYEE("Nhân viên");

    private final String description;
}