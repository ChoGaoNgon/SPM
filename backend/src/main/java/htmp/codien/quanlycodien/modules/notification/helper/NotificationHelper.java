package htmp.codien.quanlycodien.modules.notification.helper;

import java.util.Map;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import htmp.codien.quanlycodien.modules.notification.enums.NotificationEvent;
import htmp.codien.quanlycodien.modules.notification.service.NotificationTriggerEvent;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NotificationHelper {

        private final ApplicationEventPublisher applicationEventPublisher;

        public void fireNotification(NotificationEvent event, Map<String, Object> context) {
                applicationEventPublisher.publishEvent(new NotificationTriggerEvent(event, context));
        }

        public static String templateRender(String template, Map<String, Object> ctx) {
                if (template == null)
                        return null;
                for (var e : ctx.entrySet()) {
                        template = template.replace(
                                        "{" + e.getKey() + "}",
                                        String.valueOf(e.getValue()));
                }
                return template;
        }
}
