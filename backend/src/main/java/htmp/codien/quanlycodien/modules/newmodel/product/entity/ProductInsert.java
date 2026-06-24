package htmp.codien.quanlycodien.modules.newmodel.product.entity;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductInsertType;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductInsertUnit;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "product_insert")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductInsert extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_plan_id")
    ProductPlan plan;

    @Column(name = "code", length = 255)
    String code;

    @Column(name = "name", length = 255)
    String name;

    @Column(name = "quantity")
    Integer quantity;

    @Column(name = "supplier", length = 255)
    String supplier;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 20)
    ProductInsertType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "unit", length = 20)
    ProductInsertUnit unit;

    @PrePersist
    @PreUpdate
    private void applyDefaultValues() {
        if (type == null) {
            type = ProductInsertType.INSERT;
        }
        if (unit == null) {
            unit = ProductInsertUnit.PCS;
        }
    }
}
