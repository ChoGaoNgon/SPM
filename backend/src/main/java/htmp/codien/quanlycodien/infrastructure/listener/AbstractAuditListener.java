package htmp.codien.quanlycodien.infrastructure.listener;

import java.lang.reflect.Field;
import java.util.Set;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.audit.entity.AuditLog;
import htmp.codien.quanlycodien.modules.audit.entity.AuditLogDetail;
import htmp.codien.quanlycodien.modules.audit.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Slf4j
public abstract class AbstractAuditListener {

    protected final AuditService auditService;

    protected static final Set<String> EXCLUDED_FIELDS = Set.of(
            "createdAt", "updatedAt", "createdBy", "updatedBy",
            "created_at", "updated_at", "created_by", "updated_by",
            "lastModifiedDate", "lastModifiedBy", "creationDate", "createdDate",
            "version", "optimisticLockVersion");

    protected static final Set<String> EXCLUDED_ENTITIES = Set.of(
            "NotificationTemplate", "NotificationReceiver", "NotificationRule",
            "NotificationTarget", "Notification", "AuditLog", "AuditLogDetail", "EmployeeSession", "Attendance");

    protected boolean shouldExcludeField(String fieldName) {
        return EXCLUDED_FIELDS.contains(fieldName);
    }

    protected boolean isAuditEntity(Object entity) {
        return entity instanceof AuditLog || entity instanceof AuditLogDetail;
    }

    protected boolean shouldExcludeEntity(Object entity) {
        if (entity == null) {
            return true;
        }

        String entityName = entity.getClass().getSimpleName();
        return EXCLUDED_ENTITIES.contains(entityName);
    }

    protected String convertValueToString(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof BaseEntity) {
            BaseEntity entity = (BaseEntity) value;
            String entityName = getEntityDisplayName(entity);
            return String.format("%s(id=%s, name=%s)",
                    entity.getClass().getSimpleName(),
                    entity.getId(),
                    entityName);
        }

        return value.toString();
    }

    private String getEntityDisplayName(BaseEntity entity) {
        try {
            String[] possibleNameFields = { "name", "title", "code", "username", "email", "id" };

            for (String fieldName : possibleNameFields) {
                try {
                    Field field = entity.getClass().getDeclaredField(fieldName);
                    field.setAccessible(true);
                    Object fieldValue = field.get(entity);
                    if (fieldValue != null) {
                        return fieldValue.toString();
                    }
                } catch (NoSuchFieldException ignored) {
                }
            }
        } catch (Exception e) {
            log.warn("Error getting display name for entity {}: {}", entity.getClass().getSimpleName(), e.getMessage());
        }

        return "Unknown";
    }
}