package htmp.codien.quanlycodien.modules.notification.entity;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationType;
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
@Table(name = "notification_templates", uniqueConstraints = {
        @UniqueConstraint(name = "uk_notification_template", columnNames = { "event_code" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationTemplate extends BaseEntity {
    @Column(name = "event_code", nullable = false, length = 100)
    String eventCode;

    @Column(name = "title_template", nullable = false)
    String titleTemplate;

    @Column(name = "message_template", columnDefinition = "TEXT")
    String messageTemplate;

    @Column(name = "url_template")
    String urlTemplate;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false)
    NotificationType notificationType;

    @Column(name = "is_active")
    Boolean isActive;
}