package htmp.codien.quanlycodien.modules.notification.service;

import java.util.List;
import java.util.Optional;

import htmp.codien.quanlycodien.modules.notification.dto.NotificationRuleRequest;
import htmp.codien.quanlycodien.modules.notification.dto.NotificationRuleResponse;

public interface NotificationRuleService {
    List<NotificationRuleResponse> getAll();

    Optional<NotificationRuleResponse> getById(Long id);

    NotificationRuleResponse create(NotificationRuleRequest request);

    NotificationRuleResponse update(Long id, NotificationRuleRequest request);

    void delete(Long id);
}
