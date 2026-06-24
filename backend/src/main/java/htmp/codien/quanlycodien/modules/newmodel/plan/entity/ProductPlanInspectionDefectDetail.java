package htmp.codien.quanlycodien.modules.newmodel.plan.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductDefectCode;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.InspectionDefectType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

@Entity
@Table(name = "product_plan_inspection_defect_details")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductPlanInspectionDefectDetail extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id", nullable = false)
    @JsonIgnore
    ProductPlanInspection inspection;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "defect_code_id", nullable = false)
    @JsonIgnore
    ProductDefectCode defectCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "defect_type", nullable = false, length = 30)
    InspectionDefectType defectType;

    @Column(name = "quantity", nullable = false)
    Integer quantity;

    @Column(name = "note", columnDefinition = "TEXT")
    String note;
}
