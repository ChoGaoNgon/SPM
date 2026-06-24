package htmp.codien.quanlycodien.modules.permission.service;

import java.util.List;
import java.util.Set;

import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.modules.employee.dto.EmployeeResponse;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.permission.entity.Permission;

public interface PermissionService {
    Set<String> getPermissionsForEmployee(Long employeeId);

    List<EmployeeResponse> getEmployeesByPermission(String permissionCode);

    Permission createPermission(String code, String description);

    Permission updatePermission(String code, String description);

    void deletePermission(String code);

    List<Permission> getAllPermissions();

    void assignPermissionToRole(Role role, String permissionCode);

    void revokePermissionFromRole(Role role, String permissionCode);

    Set<String> getPermissionsByRole(Role role);

    void grantPermissionToEmployee(Long employeeId, String permissionCode);

    void revokePermissionFromEmployee(Long employeeId, String permissionCode);

    boolean hasPermission(Employee employee, String permissionCode);

}