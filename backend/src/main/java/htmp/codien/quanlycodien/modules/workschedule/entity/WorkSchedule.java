package htmp.codien.quanlycodien.modules.workschedule.entity;

import java.time.LocalDate;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "work_schedules")
public class WorkSchedule extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id", nullable = false)
    Shift shift;

    @Column(name = "work_date", nullable = false)
    LocalDate workDate;

    @JoinColumn(name = "employee_id", nullable = false)
    @ManyToOne
    Employee employee;

    @Column(name = "is_overtime")
    Boolean isOvertime;

    @Column(name = "status")
    String status;

}