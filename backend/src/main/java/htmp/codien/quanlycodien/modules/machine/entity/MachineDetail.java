package htmp.codien.quanlycodien.modules.machine.entity;

import java.time.LocalDate;

import htmp.codien.quanlycodien.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "machine_details")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MachineDetail extends BaseEntity {

    String name;

    String model;

    @Column(unique = true)
    String serial;

    String voltage;

    String maker;

    LocalDate productionStartTime;

    LocalDate dispatchTime;

    Double electricPower;

    @ManyToOne()
    @JoinColumn(name = "machine_id", nullable = false)
    Machine machine;

}
