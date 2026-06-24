package htmp.codien.quanlycodien.modules.notification.dto;

import java.time.LocalDateTime;

import htmp.codien.quanlycodien.modules.notification.enums.NotificationType;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationReceiverDTO {
    Long notificationId;
    String title;
    String message;
    NotificationType type;
    String url;
    Boolean isRead;
    LocalDateTime createdAt;
    String departmentName;
}
