package htmp.codien.quanlycodien.modules.newmodel.plan.entity;

import java.time.LocalDateTime;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.common.enums.ApprovalStatus;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
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
@Table(name = "product_plan_approvals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductPlanApproval extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    ProductPlan plan;

    @Column(name = "approval_type")
    String approvalType;

    @Column(name = "approval_type_name")
    String approvalTypeName;

    @Column(name = "approval_order")
    Integer approvalOrder;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    ApprovalStatus status = ApprovalStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    Employee approvedBy;

    String remark;

    LocalDateTime approvedAt;

    @Column(name = "required_permission", length = 100)
    String requiredPermission;
}
