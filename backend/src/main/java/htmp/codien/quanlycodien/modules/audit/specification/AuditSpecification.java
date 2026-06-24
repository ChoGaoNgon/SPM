package htmp.codien.quanlycodien.modules.audit.specification;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import htmp.codien.quanlycodien.modules.audit.entity.AuditLog;

public class AuditSpecification {

    public static Specification<AuditLog> hasKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            String likePattern = "%" + keyword.toLowerCase() + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("tableName")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("recordId")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("action")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("createdBy")), likePattern));
        };
    }

    public static Specification<AuditLog> hasTableName(String tableName) {
        return (root, query, criteriaBuilder) -> {
            if (tableName == null || tableName.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("tableName")),
                    "%" + tableName.toLowerCase() + "%");
        };
    }

    public static Specification<AuditLog> hasRecordId(String recordId) {
        return (root, query, criteriaBuilder) -> {
            if (recordId == null || recordId.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("recordId")),
                    "%" + recordId.toLowerCase() + "%");
        };
    }

    public static Specification<AuditLog> hasAction(String action) {
        return (root, query, criteriaBuilder) -> {
            if (action == null || action.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(criteriaBuilder.upper(root.get("action")),
                    action.toUpperCase());
        };
    }

    public static Specification<AuditLog> hasActionsIn(List<String> actions) {
        return (root, query, criteriaBuilder) -> {
            if (actions == null || actions.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return root.get("action").in(actions);
        };
    }

    public static Specification<AuditLog> hasCreatedBy(String createdBy) {
        return (root, query, criteriaBuilder) -> {
            if (createdBy == null || createdBy.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("createdBy")),
                    "%" + createdBy.toLowerCase() + "%");
        };
    }

    public static Specification<AuditLog> createdBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return (root, query, criteriaBuilder) -> {
            if (startDate == null && endDate == null) {
                return criteriaBuilder.conjunction();
            }
            if (startDate != null && endDate != null) {
                return criteriaBuilder.between(root.get("createdAt"), startDate, endDate);
            }
            if (startDate != null) {
                return criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), startDate);
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), endDate);
        };
    }

    public static Specification<AuditLog> createdOnDate(LocalDateTime date) {
        return (root, query, criteriaBuilder) -> {
            if (date == null) {
                return criteriaBuilder.conjunction();
            }
            LocalDateTime startOfDay = date.toLocalDate().atStartOfDay();
            LocalDateTime endOfDay = date.toLocalDate().atTime(23, 59, 59);
            return criteriaBuilder.between(root.get("createdAt"), startOfDay, endOfDay);
        };
    }

    public static Specification<AuditLog> createdToday() {
        return (root, query, criteriaBuilder) -> {
            LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
            LocalDateTime endOfDay = LocalDateTime.now().toLocalDate().atTime(23, 59, 59);
            return criteriaBuilder.between(root.get("createdAt"), startOfDay, endOfDay);
        };
    }

    public static Specification<AuditLog> hasTableNamesIn(List<String> tableNames) {
        return (root, query, criteriaBuilder) -> {
            if (tableNames == null || tableNames.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return root.get("tableName").in(tableNames);
        };
    }

    public static Specification<AuditLog> excludeTableNames(List<String> excludeTableNames) {
        return (root, query, criteriaBuilder) -> {
            if (excludeTableNames == null || excludeTableNames.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.not(root.get("tableName").in(excludeTableNames));
        };
    }

    public static Specification<AuditLog> hasDetails() {
        return (root, query, criteriaBuilder) -> {
            return criteriaBuilder.isNotEmpty(root.get("details"));
        };
    }
}
