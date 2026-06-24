package htmp.codien.quanlycodien.modules.newmodel.product.entity;

import java.math.BigDecimal;

import htmp.codien.quanlycodien.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "product_machines")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductMachine extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    Product product;

    @Column(name = "machine_capacity_quotation", precision = 10, scale = 2)
    BigDecimal machineCapacityQuotation;

    @Column(name = "machine_capacity_target", precision = 10, scale = 2)
    BigDecimal machineCapacityTarget;

    @Column(name = "machine_capacity_actual", precision = 10, scale = 2)
    BigDecimal machineCapacityActual;

    @Column(name = "cycle_time_quatation", precision = 10, scale = 2)
    BigDecimal cycleTimeQuotation;

    @Column(name = "cycle_time_target", precision = 10, scale = 2)
    BigDecimal cycleTimeTarget;

    @Column(name = "cycle_time_actual", precision = 10, scale = 2)
    BigDecimal cycleTimeActual;

    @Column(name = "product_weight_g", precision = 10, scale = 2)
    BigDecimal productWeightG;

    @Column(name = "product_weight_actual_g", precision = 10, scale = 2)
    BigDecimal productWeightActualG;

    @Column(name = "runner_weight_g", precision = 10, scale = 2)
    BigDecimal runnerWeightG;

    @Column(name = "runner_weight_actual_g", precision = 10, scale = 2)
    BigDecimal runnerWeightActualG;

    @Column(name = "cavity")
    Integer cavity;

    @Column(name = "gate_type", length = 50)
    String gateType;

    @Column(columnDefinition = "TEXT")
    String remark;
}