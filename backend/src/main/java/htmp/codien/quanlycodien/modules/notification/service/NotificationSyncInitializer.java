package htmp.codien.quanlycodien.modules.notification.service;

import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.modules.notification.entity.NotificationRule;
import htmp.codien.quanlycodien.modules.notification.entity.NotificationTemplate;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationEvent;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationTargetType;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationType;
import htmp.codien.quanlycodien.modules.notification.repository.NotificationRuleRepository;
import htmp.codien.quanlycodien.modules.notification.repository.NotificationTemplateRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NotificationSyncInitializer {

    private static final Logger log = LoggerFactory.getLogger(NotificationSyncInitializer.class);

    private final NotificationRuleRepository notificationRuleRepository;
    private final NotificationTemplateRepository notificationTemplateRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void syncMissingRulesAndTemplates() {
        List<String> activeEvents = Arrays.asList(NotificationEvent.values()).stream()
                .map(NotificationEvent::name)
                .toList();

        for (String event : activeEvents) {
            notificationRuleRepository.findByEventCode(event).orElseGet(() -> {
                NotificationRule rule = NotificationRule.builder()
                        .eventCode(event)
                        .targetType(NotificationTargetType.ALL)
                        .targetValue(null)
                        .isActive(Boolean.FALSE)
                        .build();
                log.info("[NotificationSync] Insert missing rule for event {}", event);
                return notificationRuleRepository.save(rule);
            });

            notificationTemplateRepository.findByEventCode(event).orElseGet(() -> {
                NotificationTemplate template = NotificationTemplate.builder()
                        .eventCode(event)
                        .titleTemplate("[Chưa cấu hình]")
                        .messageTemplate("[Chưa cấu hình]")
                        .urlTemplate(null)
                        .notificationType(NotificationType.SYSTEM)
                        .isActive(Boolean.FALSE)
                        .build();
                log.info("[NotificationSync] Insert missing template for event {}", event);
                return notificationTemplateRepository.save(template);
            });
        }

        notificationRuleRepository.deleteByEventCodeNotIn(activeEvents);
        notificationTemplateRepository.deleteByEventCodeNotIn(activeEvents);
    }
}
