package htmp.codien.quanlycodien.modules.mold.specification;

import org.springframework.data.jpa.domain.Specification;

import htmp.codien.quanlycodien.modules.mold.entity.Mold;

public class MoldSpecification {

        public static Specification<Mold> searchByKeyword(String keyword) {
                return (root, query, criteriaBuilder) -> {
                        if (keyword == null || keyword.trim().isEmpty()) {
                                return criteriaBuilder.conjunction();
                        }

                        String likePattern = "%" + keyword.trim().toLowerCase() + "%";

                        return criteriaBuilder.or(
                                        criteriaBuilder.like(criteriaBuilder.lower(root.get("code")), likePattern),
                                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), likePattern),
                                        criteriaBuilder.like(criteriaBuilder.lower(root.get("factory")), likePattern),
                                        criteriaBuilder.like(
                                                        criteriaBuilder
                                                                        .lower(criteriaBuilder.function("CAST",
                                                                                        String.class,
                                                                                        root.get("isTransfer"))),
                                                        likePattern),
                                        criteriaBuilder.like(
                                                        criteriaBuilder
                                                                        .lower(criteriaBuilder.function("CAST",
                                                                                        String.class,
                                                                                        root.get("numRepair"))),
                                                        likePattern),
                                        criteriaBuilder.like(
                                                        criteriaBuilder.lower(
                                                                        criteriaBuilder.function("CAST", String.class,
                                                                                        root.get("expectedStartDate"))),
                                                        likePattern),
                                        criteriaBuilder.like(
                                                        criteriaBuilder
                                                                        .lower(criteriaBuilder.function("CAST",
                                                                                        String.class,
                                                                                        root.get("expectedEndDate"))),
                                                        likePattern));
                };
        }

}
