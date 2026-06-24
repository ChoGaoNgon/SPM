package htmp.codien.quanlycodien.modules.newmodel.productEvent.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;

@Entity
@Table(name = "product_event_production_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductEventProductionLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan")
    @JsonIgnore
    ProductPlan plan;

    @Column(name = "production_date")
    LocalDate productionDate;

    @Column(name = "actual_output")
    Integer actualOutput;

    @Column(name = "defect_type", length = 255)
    String defectType;

    @Column(name = "defect_quantity")
    Integer defectQuantity;

    @Column(name = "defect_rate", precision = 10, scale = 2)
    BigDecimal defectRate;

    @Column(columnDefinition = "TEXT")
    String remark;
}
