package htmp.codien.quanlycodien.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum ApprovalStatus {
    APPROVED("Đã phê duyệt"),
    REJECTED("Bị từ chối"),
    PENDING("Đang chờ phê duyệt");

    private final String description;

}
