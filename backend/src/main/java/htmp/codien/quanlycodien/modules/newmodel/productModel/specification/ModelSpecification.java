package htmp.codien.quanlycodien.modules.newmodel.productModel.specification;

import org.springframework.data.jpa.domain.Specification;

import htmp.codien.quanlycodien.modules.customer.entity.Customer;
import htmp.codien.quanlycodien.modules.mold.entity.Mold;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.Product;
import htmp.codien.quanlycodien.modules.newmodel.productModel.entity.Model;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;

public class ModelSpecification {
    public static Specification<Model> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return null;
            }

            query.distinct(true);

            String kw = "%" + keyword.toLowerCase() + "%";

            Join<Model, Customer> customerJoin = root.join("customer", JoinType.LEFT);
            Join<Model, Product> productJoin = root.join("products", JoinType.LEFT);
            Join<Product, Mold> moldJoin = productJoin.join("mold", JoinType.LEFT);

            return cb.or(
                    cb.like(cb.lower(root.get("code")), kw),
                    cb.like(cb.lower(productJoin.get("name")), kw),
                    cb.like(
                            cb.function("DATE_FORMAT", String.class, root.get("orderedDate"), cb.literal("%Y-%m-%d")),
                            kw),
                    cb.like(cb.lower(customerJoin.get("name")), kw),
                    cb.like(cb.lower(productJoin.get("code")), kw),
                    cb.like(cb.lower(moldJoin.get("code")), kw));
        };
    }

}
