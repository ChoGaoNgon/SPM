package htmp.codien.quanlycodien.modules.newmodel.productEvent.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.common.enums.HtmpResult;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;

@Entity
@Table(name = "product_event_qc_check")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductEventQcCheck extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan")
    ProductPlan plan;

    @Column(name = "qc_date")
    LocalDate qcDate;

    @Column(name = "inspected_quantity")
    Integer inspectedQuantity;

    @Column(name = "ng_quantity")
    Integer ngQuantity;

    @Column(name = "ng_ratio", precision = 5, scale = 2)
    BigDecimal ngRatio;

    @Enumerated(EnumType.STRING)
    @Column(name = "visual_result", length = 10)
    HtmpResult visualResult;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visual_checked_by")
    @JsonIgnore
    Employee visualCheckedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "dimension_result", length = 10)
    HtmpResult dimensionResult;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dimension_checked_by")
    @JsonIgnore
    Employee dimensionCheckedBy;

    @Column(columnDefinition = "TEXT")
    String issueDescription;

    @Column(name = "allow_shipment")
    Boolean allowShipment;
}
