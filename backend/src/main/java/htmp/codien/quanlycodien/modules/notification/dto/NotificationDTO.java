package htmp.codien.quanlycodien.modules.notification.dto;

import java.util.List;

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
public class NotificationDTO {
    String title;
    String message;
    List<TargetInput> targets;
    NotificationType type;
    String url;
    Object context;
}