package htmp.codien.quanlycodien.modules.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import htmp.codien.quanlycodien.modules.notification.entity.NotificationTarget;

public interface NotificationTargetRepository extends JpaRepository<NotificationTarget, Long> {

}
