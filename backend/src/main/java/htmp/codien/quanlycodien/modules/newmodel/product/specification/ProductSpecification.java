package htmp.codien.quanlycodien.modules.newmodel.product.specification;

import org.springframework.data.jpa.domain.Specification;

import htmp.codien.quanlycodien.modules.customer.entity.Customer;
import htmp.codien.quanlycodien.modules.mold.entity.Mold;
import htmp.codien.quanlycodien.modules.newmodel.productModel.entity.Model;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.Product;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;

public class ProductSpecification {

    public static Specification<Product> hasKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return null;
            }

            String kw = "%" + keyword.toLowerCase() + "%";

            Join<Product, Mold> moldJoin = root.join("mold", JoinType.LEFT);
            Join<Model, Customer> customerJoin = root.join("customer", JoinType.LEFT);
            Join<Product, Model> modelJoin = root.join("products", JoinType.LEFT);

            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("code")), kw),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), kw),
                    criteriaBuilder.like(criteriaBuilder.lower(moldJoin.get("code")), kw),
                    criteriaBuilder.like(criteriaBuilder.lower(moldJoin.get("type")), kw),
                    criteriaBuilder.like(
                            criteriaBuilder.function("DATE_FORMAT", String.class, root.get("orderedDate"),
                                    criteriaBuilder.literal("%Y-%m-%d")),
                            kw),
                    criteriaBuilder.like(criteriaBuilder.lower(modelJoin.get("name")), kw),
                    criteriaBuilder.like(criteriaBuilder.lower(modelJoin.get("code")), kw),
                    criteriaBuilder.like(criteriaBuilder.lower(customerJoin.get("name")), kw));
        };
    }
}
