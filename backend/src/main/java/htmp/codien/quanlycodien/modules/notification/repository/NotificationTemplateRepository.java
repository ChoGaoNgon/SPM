package htmp.codien.quanlycodien.modules.notification.repository;

import java.util.Collection;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import htmp.codien.quanlycodien.modules.notification.entity.NotificationTemplate;

public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, Long> {
    Optional<NotificationTemplate> findByEventCodeAndIsActiveTrue(String event);

    Optional<NotificationTemplate> findByEventCode(String event);

    boolean existsByEventCode(String eventCode);

    boolean existsByEventCodeAndIdNot(String eventCode, Long id);

    @Modifying
    @Query("delete from NotificationTemplate t where t.eventCode not in :events")
    void deleteByEventCodeNotIn(Collection<String> events);
}
