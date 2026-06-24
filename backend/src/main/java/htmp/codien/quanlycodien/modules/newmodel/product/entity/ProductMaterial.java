package htmp.codien.quanlycodien.modules.newmodel.product.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import htmp.codien.quanlycodien.common.BaseEntity;

@Entity
@Table(name = "product_materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductMaterial extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    Product product;

    @Column(name = "is_quotation")
    Boolean isQuotation;

    @Column(name = "mat_type", length = 100)
    String matType;

    @Column(name = "mat_grade", length = 100)
    String matGrade;

    @Column(name = "mat_color_code", length = 100)
    String matColorCode;

    @Column(name = "mat_color_name", length = 100)
    String matColorName;

    @Column(name = "mat_maker", length = 100)
    String matMaker;

    @Column(name = "mat_moq")
    Integer matMoq;

    @Column(name = "recycling_rate")
    Double recyclingRate;

    @Column(name = "remark", columnDefinition = "TEXT")
    String remark;
}
