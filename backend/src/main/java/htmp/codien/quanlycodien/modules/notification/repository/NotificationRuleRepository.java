package htmp.codien.quanlycodien.modules.notification.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import htmp.codien.quanlycodien.modules.notification.entity.NotificationRule;

public interface NotificationRuleRepository extends JpaRepository<NotificationRule, Long> {
    List<NotificationRule> findByEventCodeAndIsActiveTrue(String event);

    Optional<NotificationRule> findByEventCode(String event);

    boolean existsByEventCode(String eventCode);

    boolean existsByEventCodeAndIdNot(String eventCode, Long id);

    @Modifying
    @Query("delete from NotificationRule r where r.eventCode not in :events")
    void deleteByEventCodeNotIn(Collection<String> events);
}
