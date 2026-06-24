package htmp.codien.quanlycodien.modules.notification.entity;

import java.util.List;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationEvent;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notification extends BaseEntity {
    @Enumerated(EnumType.STRING)
    @Column(name = "event_code", length = 100)
    NotificationEvent eventCode;

    @Column(nullable = false)
    String title;

    @Column(columnDefinition = "TEXT")
    String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    NotificationType type;

    String url;

    @OneToMany(mappedBy = "notification")
    private List<NotificationReceiver> notificationReceivers;
}
