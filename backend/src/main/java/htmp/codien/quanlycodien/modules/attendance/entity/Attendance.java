package htmp.codien.quanlycodien.modules.attendance.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.attendance.enums.AttendanceStatus;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.workschedule.entity.Shift;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "attendance")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Attendance extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id")
    Shift shift;

    @Column(name = "work_date", nullable = false)
    LocalDate workDate;

    @Column(name = "checkin_time")
    LocalDateTime checkinTime;

    @Column(name = "checkout_time")
    LocalDateTime checkoutTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    AttendanceStatus status;
}