package htmp.codien.quanlycodien.infrastructure.listener;

import java.util.HashMap;
import java.util.Map;

import org.hibernate.event.spi.PostInsertEvent;
import org.hibernate.event.spi.PostInsertEventListener;
import org.hibernate.persister.entity.EntityPersister;
import org.springframework.stereotype.Component;

import htmp.codien.quanlycodien.infrastructure.context.RequestContext;
import htmp.codien.quanlycodien.modules.audit.service.AuditService;

@Component
public class AuditInsertListener extends AbstractAuditListener implements PostInsertEventListener {

    public AuditInsertListener(AuditService auditService) {
        super(auditService);
    }

    @Override
    public void onPostInsert(PostInsertEvent event) {
        Object entity = event.getEntity();

        if (shouldExcludeEntity(entity)) {
            return;
        }

        String[] propertyNames = event.getPersister().getPropertyNames();
        Object[] state = event.getState();

        Map<String, Object> newValues = new HashMap<>();

        for (int i = 0; i < propertyNames.length; i++) {
            String fieldName = propertyNames[i];

            if (shouldExcludeField(fieldName)) {
                continue;
            }

            newValues.put(fieldName, convertValueToString(state[i]));
        }

        Object id = event.getId();
        if (id == null) {
            return;
        }

        String requestId = RequestContext.getRequestId();

        auditService.saveAuditLog(
                entity.getClass().getSimpleName(),
                id.toString(),
                "INSERT",
                new HashMap<>(),
                newValues,
                requestId);
    }

    @Override
    public boolean requiresPostCommitHandling(EntityPersister persister) {
        return true;
    }
}