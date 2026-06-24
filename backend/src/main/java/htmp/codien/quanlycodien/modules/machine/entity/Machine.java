
package htmp.codien.quanlycodien.modules.machine.entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "machines")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Machine extends BaseEntity {
    @Column(length = 50)
    String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specification_id")
    MachineSpecification specification;

    @Column(name = "machine_no")
    Long machineNo;

    @Column(name = "dimension", length = 50)
    String dimension;

    @OneToMany(mappedBy = "machine", cascade = CascadeType.ALL, orphanRemoval = true)
    List<MachineDetail> machineDetail;

    @OneToMany(mappedBy = "machine", fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    List<ProductPlan> productPlans = new ArrayList<>();

    @ManyToOne()
    @JoinColumn(name = "machine_type_id", nullable = false)
    MachineType machineType;

    @Column(name = "screw")
    String screw;

    @Column(name = "description")
    String description;

    @Column(name = "total_electric_power")
    String totalElectricPower;

    @Column(name = "capacity_ton")
    String capacityTon;

    @Column(name = "position")
    String position;
}
