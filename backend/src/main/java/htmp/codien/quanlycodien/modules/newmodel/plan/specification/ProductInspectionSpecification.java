package htmp.codien.quanlycodien.modules.newmodel.plan.specification;

import org.springframework.data.jpa.domain.Specification;

import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanInspection;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

public class ProductInspectionSpecification {

    private ProductInspectionSpecification() {
    }

    public static Specification<ProductPlanInspection> pendingQcInputWithKeyword(String keyword) {
        return (root, query, cb) -> {
            query.distinct(true);

            Join<Object, Object> planJoin = root.join("plan", JoinType.LEFT);
            Join<Object, Object> productJoin = planJoin.join("product", JoinType.LEFT);
            Join<Object, Object> modelJoin = productJoin.join("model", JoinType.LEFT);
            Join<Object, Object> customerJoin = modelJoin.join("customer", JoinType.LEFT);

            Predicate pendingPredicate = cb.and(
                    cb.isNotNull(root.get("inspectionDeadline")),
                    cb.or(
                            cb.isNull(root.get("inspectionDateActual")),
                            cb.isNull(root.get("inspectedQuantity")),
                            cb.isNull(root.get("finalResult"))));

            if (keyword == null || keyword.trim().isEmpty()) {
                return pendingPredicate;
            }

            String normalizedKeyword = "%" + keyword.trim().toLowerCase() + "%";

            Predicate keywordPredicate = cb.or(
                    cb.like(cb.lower(cb.coalesce(planJoin.get("name"), "")), normalizedKeyword),
                    cb.like(cb.lower(cb.coalesce(productJoin.get("code"), "")), normalizedKeyword),
                    cb.like(cb.lower(cb.coalesce(modelJoin.get("code"), "")), normalizedKeyword),
                    cb.like(cb.lower(cb.coalesce(customerJoin.get("name"), "")), normalizedKeyword));

            return cb.and(pendingPredicate, keywordPredicate);
        };
    }
}