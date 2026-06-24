package htmp.codien.quanlycodien.modules.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import htmp.codien.quanlycodien.modules.notification.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

}
