package htmp.codien.quanlycodien.modules.notification.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum NotificationType {
    ATTENDANCE("Chấm công"),
    NEW_MODEL("New Model"),
    APPROVAL("Phê duyệt"),
    OVERTIME("Tăng ca"),
    SHIFT_CHANGE("Đổi ca"),
    SYSTEM_FEEDBACK("Góp ý hệ thống"),
    SYSTEM("Hệ thống");

    private final String description;

}
