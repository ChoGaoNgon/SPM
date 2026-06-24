package htmp.codien.quanlycodien.modules.notification.dto;

import htmp.codien.quanlycodien.modules.notification.enums.NotificationEvent;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationTargetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRuleRequest {
    private NotificationEvent eventCode;
    private NotificationTargetType targetType;
    private String targetValue;
    private Boolean isActive;
}
