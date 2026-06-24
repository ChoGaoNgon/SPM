package htmp.codien.quanlycodien.modules.permission.entity;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "employee_permissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeePermission extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permission_id", nullable = false)
    Permission permission;

    @Column(nullable = false)
    @Builder.Default
    Boolean isGranted = true;
}