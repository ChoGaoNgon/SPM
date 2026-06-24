package htmp.codien.quanlycodien.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
@Getter
@AllArgsConstructor
public enum ApprovalLevel {
    LEVEL0("Nhân viên đồng ý/từ chối trực tiếp"),
    LEVEL1("Quản lý trực tiếp (NVHTQL, TC, NVCC, GS, GSCC))"),
    LEVEL2("Trưởng phòng"),
    LEVEL3("Ban giám đốc");

    private final String description;
}
