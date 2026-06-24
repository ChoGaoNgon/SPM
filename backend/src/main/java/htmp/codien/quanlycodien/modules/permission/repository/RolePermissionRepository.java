package htmp.codien.quanlycodien.modules.permission.repository;

import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.modules.permission.entity.RolePermission;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
    List<RolePermission> findByRoleName(Role roleName);

    void deleteByPermission_Id(Long permissionId);
}