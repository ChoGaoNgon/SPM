package htmp.codien.quanlycodien.modules.feedback.specification;

import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import htmp.codien.quanlycodien.modules.feedback.entity.SystemFeedback;
import htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus;

public class SystemFeedbackSpecification {
    public static Specification<SystemFeedback> searchByKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return null;
            }

            String likePattern = "%" + keyword.trim().toLowerCase() + "%";

            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("requestType")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("status")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("createdBy")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("priority")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("response")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("module")), likePattern));
        };
    }

    public static Specification<SystemFeedback> byCreatedBy(String employeeCode) {
        return (root, query, cb) -> cb.equal(root.get("createdBy"), employeeCode);
    }

    public static Specification<SystemFeedback> hasStatuses(List<SystemFeedbackStatus> statuses) {
        return (root, query, cb) -> {
            if (statuses == null || statuses.isEmpty()) {
                return null;
            }

            return root.get("status").in(statuses);
        };
    }

}
