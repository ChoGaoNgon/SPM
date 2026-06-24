package htmp.codien.quanlycodien.modules.newmodel.product.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import htmp.codien.quanlycodien.common.BaseEntity;

@Entity
@Table(name = "product_packing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductPacking extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    Product product;

    @Column(name = "box_type", length = 50)
    String boxType;

    @Column(name = "cover_type", length = 255)
    String coverType;

    @Column(name = "pcs_per_cover")
    Integer pcsPerCover;

    @Column(name = "cover_per_box")
    Integer coverPerBox;

    @Column(name = "is_one_time_box")
    Boolean isOneTimeBox;

    @Column(name = "box_invest_qty", precision = 10, scale = 2)
    Integer boxInvestQty;

    @Column(columnDefinition = "TEXT")
    String remark;
}
