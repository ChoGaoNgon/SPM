package htmp.codien.quanlycodien.modules.asset.specification;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.jpa.domain.Specification;

import htmp.codien.quanlycodien.modules.asset.entity.Asset;
import htmp.codien.quanlycodien.modules.asset.entity.AssetBorrow;
import htmp.codien.quanlycodien.modules.asset.enums.AssetBorrowStatus;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;

public class AssetBorrowSpecification {

    public static Specification<AssetBorrow> hasKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return null;
            }

            String kw = "%" + keyword.toLowerCase() + "%";

            Join<AssetBorrow, Asset> assetJoin = root.join("asset");

            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("purpose")), kw),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("remark")), kw),
                    criteriaBuilder.like(criteriaBuilder.lower(assetJoin.get("code")), kw),
                    criteriaBuilder.like(criteriaBuilder.lower(assetJoin.get("name")), kw));
        };
    }

    public static Specification<AssetBorrow> hasRequestedById(Long requestedById) {
        return (root, query, criteriaBuilder) -> {
            if (requestedById == null) {
                return criteriaBuilder.conjunction();
            }

            Join<AssetBorrow, Employee> requestedByJoin = root.join("requestedBy");
            return criteriaBuilder.equal(requestedByJoin.get("id"), requestedById);
        };
    }

    public static Specification<AssetBorrow> hasStatus(AssetBorrowStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) {
                return criteriaBuilder.conjunction();
            }

            return criteriaBuilder.equal(root.get("status"), status);
        };
    }

    public static Specification<AssetBorrow> hasAnyActionOnDate(LocalDate date) {
        return (root, query, criteriaBuilder) -> {
            if (date == null) {
                return criteriaBuilder.conjunction();
            }

            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(23, 59, 59, 999999999);

            Predicate borrowAtCondition = criteriaBuilder.and(
                    criteriaBuilder.isNotNull(root.get("borrowAt")),
                    criteriaBuilder.between(root.get("borrowAt"), startOfDay, endOfDay));

            Predicate expectedReturnAtCondition = criteriaBuilder.and(
                    criteriaBuilder.isNotNull(root.get("expectedReturnAt")),
                    criteriaBuilder.between(root.get("expectedReturnAt"), startOfDay, endOfDay));

            Predicate actualReturnAtCondition = criteriaBuilder.and(
                    criteriaBuilder.isNotNull(root.get("actualReturnAt")),
                    criteriaBuilder.between(root.get("actualReturnAt"), startOfDay, endOfDay));

            Predicate approvedAtCondition = criteriaBuilder.and(
                    criteriaBuilder.isNotNull(root.get("approvedAt")),
                    criteriaBuilder.between(root.get("approvedAt"), startOfDay, endOfDay));

            return criteriaBuilder.or(
                    borrowAtCondition,
                    expectedReturnAtCondition,
                    actualReturnAtCondition,
                    approvedAtCondition);
        };
    }

    public static Specification<AssetBorrow> hasBorrowDate(LocalDate date) {
        return (root, query, criteriaBuilder) -> {
            if (date == null) {
                return criteriaBuilder.conjunction();
            }

            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(23, 59, 59, 999999999);

            return criteriaBuilder.and(
                    criteriaBuilder.isNotNull(root.get("borrowAt")),
                    criteriaBuilder.between(root.get("borrowAt"), startOfDay, endOfDay));
        };
    }

}
