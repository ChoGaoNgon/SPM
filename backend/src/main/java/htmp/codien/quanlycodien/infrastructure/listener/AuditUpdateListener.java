package htmp.codien.quanlycodien.infrastructure.listener;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import org.hibernate.event.spi.PostUpdateEvent;
import org.hibernate.event.spi.PostUpdateEventListener;
import org.hibernate.persister.entity.EntityPersister;
import org.springframework.stereotype.Component;

import htmp.codien.quanlycodien.infrastructure.context.RequestContext;
import htmp.codien.quanlycodien.modules.audit.service.AuditService;

@Component
public class AuditUpdateListener extends AbstractAuditListener implements PostUpdateEventListener {

    public AuditUpdateListener(AuditService auditService) {
        super(auditService);
    }

    @Override
    public void onPostUpdate(PostUpdateEvent event) {
        Object entity = event.getEntity();

        if (shouldExcludeEntity(entity)) {
            return;
        }

        String[] propertyNames = event.getPersister().getPropertyNames();
        Object[] oldState = event.getOldState();
        Object[] newState = event.getState();

        Map<String, Object> oldValues = new HashMap<>();
        Map<String, Object> newValues = new HashMap<>();

        for (int i = 0; i < propertyNames.length; i++) {
            String fieldName = propertyNames[i];

            if (shouldExcludeField(fieldName)) {
                continue;
            }

            Object oldVal = oldState[i];
            Object newVal = newState[i];

            if (!Objects.equals(oldVal, newVal)) {
                oldValues.put(fieldName, convertValueToString(oldVal));
                newValues.put(fieldName, convertValueToString(newVal));
            }
        }

        if (!newValues.isEmpty()) {
            Object id = event.getId();
            if (id == null) {
                return;
            }

            String requestId = RequestContext.getRequestId();
            auditService.saveAuditLog(
                    entity.getClass().getSimpleName(),
                    id.toString(),
                    "UPDATE",
                    oldValues,
                    newValues,
                    requestId);
        }
    }

    @Override
    public boolean requiresPostCommitHandling(EntityPersister persister) {
        return true;
    }
}
