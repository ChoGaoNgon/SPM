package htmp.codien.quanlycodien.modules.newmodel.plan.entity;

import htmp.codien.quanlycodien.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "product_plan_approval_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductPlanApprovalTemplate extends BaseEntity {
    @Column(name = "approval_type")
    String approvalType;

    @Column(name = "approval_type_name")
    String approvalTypeName;

    @Column(name = "approval_order")
    Integer approvalOrder;

    @Column(name = "is_required")
    Boolean required;

    @Column(name = "required_permission", length = 100)
    String requiredPermission;
}
