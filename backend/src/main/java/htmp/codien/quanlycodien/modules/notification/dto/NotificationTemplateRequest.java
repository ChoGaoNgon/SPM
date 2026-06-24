package htmp.codien.quanlycodien.modules.notification.dto;

import htmp.codien.quanlycodien.modules.notification.enums.NotificationEvent;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationTemplateRequest {
    private NotificationEvent eventCode;
    private String titleTemplate;
    private String messageTemplate;
    private String urlTemplate;
    private NotificationType notificationType;
    private Boolean isActive;
}
