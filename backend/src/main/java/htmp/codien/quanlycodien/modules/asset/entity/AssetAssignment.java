package htmp.codien.quanlycodien.modules.asset.entity;

import java.time.LocalDate;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.department.entity.Department;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import jakarta.persistence.Entity;
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
@Table(name = "asset_assignments")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AssetAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_use_id", nullable = true)
    Employee employeeUse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_use_id", nullable = true)
    Department departmentUse;

    LocalDate assignAt;

    LocalDate returnAt;

}
