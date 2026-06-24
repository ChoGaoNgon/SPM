package htmp.codien.quanlycodien.modules.notification.service;

import java.util.List;
import java.util.Optional;

import htmp.codien.quanlycodien.modules.notification.dto.NotificationTemplateRequest;
import htmp.codien.quanlycodien.modules.notification.dto.NotificationTemplateResponse;

public interface NotificationTemplateService {
    List<NotificationTemplateResponse> getAll();

    Optional<NotificationTemplateResponse> getById(Long id);

    NotificationTemplateResponse create(NotificationTemplateRequest request);

    NotificationTemplateResponse update(Long id, NotificationTemplateRequest request);

    void delete(Long id);
}
