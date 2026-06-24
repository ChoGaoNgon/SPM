package htmp.codien.quanlycodien.modules.feedback.entity;

import java.time.LocalDateTime;
import java.util.Set;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.common.enums.Priority;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus;
import htmp.codien.quanlycodien.modules.feedback.enums.SystemRequestType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "system_feedbacks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SystemFeedback extends BaseEntity {
    @Column(name = "title", nullable = false, columnDefinition = "TEXT")
    String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false, length = 50)
    SystemRequestType requestType;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 50)
    Priority priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    SystemFeedbackStatus status;

    @Column(name = "response", columnDefinition = "TEXT")
    String response;

    @Column(name = "module", length = 100)
    String module;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assign_to_employee_id")
    Employee assignToEmployee;

    @Column(name = "impact_scope", columnDefinition = "TEXT")
    String impactScope;

    @Column(name = "primary_objective", columnDefinition = "TEXT")
    String primaryObjective;

    @Column(name = "expected_outcome", columnDefinition = "TEXT")
    String expectedOutcome;

    @Column(name = "start_time")
    LocalDateTime startTime;

    @Column(name = "end_time")
    LocalDateTime endTime;

    @Column(name = "remark", nullable = false)
    String remark;

    @OneToMany(mappedBy = "systemFeedback", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<SystemFeedbackFile> files;
}