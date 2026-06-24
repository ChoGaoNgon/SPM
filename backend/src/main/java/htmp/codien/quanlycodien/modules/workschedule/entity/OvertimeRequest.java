package htmp.codien.quanlycodien.modules.workschedule.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.workschedule.enums.WorkRequestStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "overtime_requests")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OvertimeRequest extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    Employee employee;

    @Column(name = "work_date", nullable = false)
    LocalDate workDate;

    @Column(name = "start_time", nullable = false)
    LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    LocalDateTime endTime;

    @Column(name = "actual_start_time")
    LocalDateTime actualStartTime;

    @Column(name = "actual_end_time")
    LocalDateTime actualEndTime;

    @Column(columnDefinition = "TEXT")
    String reason;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    WorkRequestStatus status = WorkRequestStatus.PENDING_MANAGER;

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<OvertimeApproval> approvals = new ArrayList<>();
}