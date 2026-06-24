package htmp.codien.quanlycodien.modules.permission.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import htmp.codien.quanlycodien.modules.permission.entity.EmployeePermission;

import java.util.List;

public interface EmployeePermissionRepository extends JpaRepository<EmployeePermission, Long> {
    List<EmployeePermission> findByEmployee_Id(Long employeeId);

    void deleteByPermission_Id(Long permissionId);
}