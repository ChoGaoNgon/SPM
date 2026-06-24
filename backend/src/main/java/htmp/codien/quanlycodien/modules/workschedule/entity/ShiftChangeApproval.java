package htmp.codien.quanlycodien.modules.workschedule.entity;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.common.enums.ApprovalLevel;
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
@Table(name = "shift_change_approvals")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShiftChangeApproval extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    ShiftChangeRequest request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id", nullable = false)
    Employee approver;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_level", nullable = false, length = 10)
    ApprovalLevel approvalLevel;

    @Column(name = "action", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    WorkRequestStatus action;

    @Column(name = "comment", columnDefinition = "TEXT")
    String comment;
}