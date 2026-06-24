package htmp.codien.quanlycodien.modules.notification.service;

import java.util.List;

import htmp.codien.quanlycodien.modules.notification.dto.NotificationDTO;
import htmp.codien.quanlycodien.modules.notification.dto.NotificationReceiverDTO;

public interface NotificationService {
    void sendNotificationTarget(NotificationDTO req);

    Long getQuantityUnreadNotification(Long employeeId);

    List<NotificationReceiverDTO> get10Notification(Long employeeId);

    List<NotificationReceiverDTO> getAllNotification(Long employeeId);

    void markAsRead(Long notificationId, Long employeeId);

    void markAllAsRead(Long employeeId);

}