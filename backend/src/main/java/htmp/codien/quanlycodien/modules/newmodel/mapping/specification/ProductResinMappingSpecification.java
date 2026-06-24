package htmp.codien.quanlycodien.modules.newmodel.mapping.specification;

import org.springframework.data.jpa.domain.Specification;

import htmp.codien.quanlycodien.modules.newmodel.mapping.entity.ProductResinMapping;

public class ProductResinMappingSpecification {

    public static Specification<ProductResinMapping> searchByKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            String likePattern = "%" + keyword.trim().toLowerCase() + "%";

            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("code")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("type")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("colorName")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("grade")), likePattern));
        };
    }
}
