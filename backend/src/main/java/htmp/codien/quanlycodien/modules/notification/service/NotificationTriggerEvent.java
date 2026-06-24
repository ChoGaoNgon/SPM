package htmp.codien.quanlycodien.modules.notification.service;

import java.util.Map;

import htmp.codien.quanlycodien.modules.notification.enums.NotificationEvent;

public record NotificationTriggerEvent(
                NotificationEvent event,
                Map<String, Object> context) {
}