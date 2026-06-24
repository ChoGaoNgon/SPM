package htmp.codien.quanlycodien.modules.newmodel.productEvent.entity;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.Product;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "product_event_requirement")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductEventRequirement extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @JsonIgnore
    Product product;

    @Column(name = "name", length = 255)
    String name;

    @Column(name = "delivery_date")
    LocalDate deliveryDate;

    @Column(name = "quantity")
    Long quantity;
}
