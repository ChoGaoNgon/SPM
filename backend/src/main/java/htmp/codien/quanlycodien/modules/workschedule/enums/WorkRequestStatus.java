package htmp.codien.quanlycodien.modules.workschedule.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum WorkRequestStatus {
    ASSIGN_EMPLOYEE("Được cấp trên giao, chờ nhân viên đồng ý/ từ chối"),
    APPROVED_BY_EMPLOYEE("Nhân viên đã đồng ý"),
    REJECTED_BY_EMPLOYEE("Nhân viên đã từ chối"),

    PENDING_MANAGER("Chờ quản lý duyệt"),
    PENDING_HEAD("Chờ trưởng phòng duyệt"),

    ASSIGN_DIRECT("Chỉ định trực tiếp"),

    APPROVED("Đã phê duyệt"),
    REJECTED("Bị từ chối");

    private final String description;
}