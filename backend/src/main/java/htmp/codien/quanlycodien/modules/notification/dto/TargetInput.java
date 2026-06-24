package htmp.codien.quanlycodien.modules.notification.dto;

import htmp.codien.quanlycodien.modules.notification.enums.NotificationTargetType;
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
public class TargetInput {
    NotificationTargetType type;
    String value;
}