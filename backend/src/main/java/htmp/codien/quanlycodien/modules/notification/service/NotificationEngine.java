package htmp.codien.quanlycodien.modules.notification.service;

import java.util.Map;

import htmp.codien.quanlycodien.modules.notification.enums.NotificationEvent;

public interface NotificationEngine {
    void fire(NotificationEvent event, Map<String, Object> context);

}
