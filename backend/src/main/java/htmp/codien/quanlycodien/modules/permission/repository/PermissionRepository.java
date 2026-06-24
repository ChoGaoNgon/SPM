package htmp.codien.quanlycodien.modules.permission.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.permission.entity.Permission;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
    Permission findByCode(String code);

    List<Permission> findAllByOrderByCodeAsc();

    @Query(value = """
            SELECT COUNT(*) > 0
            FROM employee e
            JOIN employee_role er ON e.id = er.employee_id
            JOIN role r ON er.role_id = r.id
            JOIN role_permission rp ON r.id = rp.role_id
            JOIN permission p ON rp.permission_id = p.id
            WHERE e.id = :employeeId
            AND p.code = 'APPROVE_PRODUCT_PLAN'
            """, nativeQuery = true)
    boolean hasApprovalPlanPermission(@Param("employeeId") Long employeeId);
}