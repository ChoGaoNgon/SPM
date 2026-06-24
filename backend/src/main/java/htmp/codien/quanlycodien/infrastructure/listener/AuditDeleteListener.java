package htmp.codien.quanlycodien.infrastructure.listener;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

import org.hibernate.event.spi.PostDeleteEvent;
import org.hibernate.event.spi.PostDeleteEventListener;
import org.hibernate.persister.entity.EntityPersister;
import org.hibernate.type.CollectionType;
import org.hibernate.type.Type;
import org.springframework.stereotype.Component;

import htmp.codien.quanlycodien.infrastructure.context.RequestContext;
import htmp.codien.quanlycodien.modules.audit.service.AuditService;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Component
public class AuditDeleteListener extends AbstractAuditListener implements PostDeleteEventListener {

    public AuditDeleteListener(AuditService auditService) {
        super(auditService);
    }

    @Override
    public void onPostDelete(PostDeleteEvent event) {

        Object entity = event.getEntity();

        if (entity == null) {
            return;
        }

        if (shouldExcludeEntity(entity)) {
            return;
        }

        Object[] state = event.getDeletedState();

        if (state == null) {
            return;
        }

        EntityPersister persister = event.getPersister();

        if (persister == null) {
            return;
        }

        String[] propertyNames = persister.getPropertyNames();

        Type[] propertyTypes = persister.getPropertyTypes();

        Map<String, Object> oldValues = new HashMap<>();

        for (int i = 0; i < state.length; i++) {

            String fieldName = propertyNames[i];

            if (shouldExcludeField(fieldName)) {
                continue;
            }

            if (propertyTypes[i] instanceof CollectionType) {
                continue;
            }

            Object value = state[i];

            if (value == null) {

                oldValues.put(fieldName, null);

                continue;
            }

            if (isEntity(value)) {

                Object relationId = getEntityId(value);

                oldValues.put(
                        fieldName,
                        relationId != null ? relationId.toString() : null);

                continue;
            }

            oldValues.put(
                    fieldName,
                    convertValueToString(value));
        }

        Object id = event.getId();

        if (id == null) {
            return;
        }

        String requestId = RequestContext.getRequestId();
        auditService.saveAuditLog(
                entity.getClass().getSimpleName(),
                id.toString(),
                "DELETE",
                oldValues,
                new HashMap<>(),
                requestId);
    }

    private boolean isEntity(Object obj) {

        return obj.getClass().isAnnotationPresent(Entity.class);
    }

    private Object getEntityId(Object entity) {

        try {

            Field[] fields = entity.getClass().getDeclaredFields();

            for (Field field : fields) {

                if (field.isAnnotationPresent(Id.class)) {

                    field.setAccessible(true);

                    return field.get(entity);
                }
            }

        } catch (Exception e) {

            return null;
        }

        return null;
    }

    @Override
    public boolean requiresPostCommitHandling(EntityPersister persister) {

        return false;
    }
}