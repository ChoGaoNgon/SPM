package htmp.codien.quanlycodien.modules.notification.entity;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationTargetType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "notification_rules", uniqueConstraints = {
        @UniqueConstraint(name = "uk_notification_rule", columnNames = { "event_code" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationRule extends BaseEntity {
    @Column(name = "event_code", nullable = false, length = 100)
    String eventCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false)
    NotificationTargetType targetType;

    @Column(name = "target_value", nullable = true)
    String targetValue;

    @Column(name = "is_active")
    Boolean isActive;
}
