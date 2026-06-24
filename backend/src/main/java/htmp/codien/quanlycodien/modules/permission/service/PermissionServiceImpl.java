package htmp.codien.quanlycodien.modules.permission.service;

import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.infrastructure.realtime.RealtimeService;
import htmp.codien.quanlycodien.modules.employee.dto.EmployeeResponse;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.permission.entity.EmployeePermission;
import htmp.codien.quanlycodien.modules.permission.entity.Permission;
import htmp.codien.quanlycodien.modules.permission.entity.RolePermission;
import htmp.codien.quanlycodien.modules.permission.repository.EmployeePermissionRepository;
import htmp.codien.quanlycodien.modules.permission.repository.PermissionRepository;
import htmp.codien.quanlycodien.modules.permission.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepo;
    private final RolePermissionRepository rolePermissionRepo;
    private final EmployeePermissionRepository employeePermissionRepo;
    private final EmployeeRepository employeeRepo;
    private final RealtimeService realtimeService;
    private final ModelMapper modelMapper;

    @Override
    public Set<String> getPermissionsForEmployee(Long employeeId) {
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại: " + employeeId));
        Role role = employee.getRole();

        Set<String> permissions = rolePermissionRepo.findByRoleName(role)
                .stream()
                .map(rp -> rp.getPermission().getCode())
                .collect(Collectors.toSet());

        List<EmployeePermission> empPerms = employeePermissionRepo.findByEmployee_Id(employee.getId());
        for (EmployeePermission ep : empPerms) {
            String code = ep.getPermission().getCode();
            if (ep.getIsGranted()) {
                permissions.add(code);
            } else {
                permissions.remove(code);
            }
        }

        return permissions;
    }

    @Override
    public List<EmployeeResponse> getEmployeesByPermission(String permissionCode) {
        return employeeRepo.findEmployeesByPermissionCode(permissionCode).stream()
                .map(emp -> modelMapper.map(emp, EmployeeResponse.class))
                .collect(Collectors.toList());
    }

    @Override
    public Permission createPermission(String code, String description) {
        if (permissionRepo.findByCode(code) != null) {
            throw new RuntimeException("Permission code đã tồn tại: " + code);
        }
        Permission p = Permission.builder()
                .code(code)
                .description(description)
                .build();
        return permissionRepo.save(p);
    }

    @Override
    public List<Permission> getAllPermissions() {
        return permissionRepo.findAllByOrderByCodeAsc();
    }

    @Override
    public Permission updatePermission(String code, String description) {
        Permission permission = permissionRepo.findByCode(code);
        if (permission == null) {
            throw new RuntimeException("Không tìm thấy permission: " + code);
        }
        permission.setDescription(description);
        return permissionRepo.save(permission);
    }

    @Override
    @Transactional
    public void deletePermission(String code) {
        Permission permission = permissionRepo.findByCode(code);
        if (permission == null) {
            throw new RuntimeException("Không tìm thấy permission: " + code);
        }
        rolePermissionRepo.deleteByPermission_Id(permission.getId());
        employeePermissionRepo.deleteByPermission_Id(permission.getId());
        permissionRepo.delete(permission);
    }

    @Override
    @Transactional
    public void assignPermissionToRole(Role role, String permissionCode) {
        Permission p = permissionRepo.findByCode(permissionCode);
        if (p == null)
            throw new RuntimeException("Không tìm thấy permission: " + permissionCode);

        boolean exists = rolePermissionRepo.findByRoleName(role).stream()
                .anyMatch(rp -> rp.getPermission().getCode().equals(permissionCode));
        if (exists)
            return;

        RolePermission rp = RolePermission.builder()
                .roleName(role)
                .permission(p)
                .build();
        rolePermissionRepo.save(rp);
        String msg = "Quyền '<strong>" + p.getDescription() + "</strong>' đã được cấp.";
        employeeRepo.findByRole(role).forEach(emp -> {
            Set<String> newPermissions = getPermissionsForEmployee(emp.getId());
            realtimeService.sendUpdatedPermissions(emp.getId(), newPermissions, msg);
        });
    }

    @Override
    @Transactional
    public void revokePermissionFromRole(Role role, String permissionCode) {
        List<RolePermission> rolePerms = rolePermissionRepo.findByRoleName(role);
        for (RolePermission rp : rolePerms) {
            if (rp.getPermission().getCode().equals(permissionCode)) {
                rolePermissionRepo.delete(rp);
            }
        }
        Permission p = permissionRepo.findByCode(permissionCode);
        String msg = "Quyền '<strong>" + p.getDescription() + "</strong>' đã bị thu hồi.";
        employeeRepo.findByRole(role).forEach(emp -> {
            Set<String> newPermissions = getPermissionsForEmployee(emp.getId());
            realtimeService.sendUpdatedPermissions(emp.getId(), newPermissions, msg);
        });
    }

    @Override
    public Set<String> getPermissionsByRole(Role role) {
        return rolePermissionRepo.findByRoleName(role)
                .stream()
                .map(rp -> rp.getPermission().getCode())
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional
    public void grantPermissionToEmployee(Long employeeId, String permissionCode) {
        Employee emp = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee không tồn tại"));

        Permission p = permissionRepo.findByCode(permissionCode);
        if (p == null)
            throw new RuntimeException("Không tìm thấy permission: " + permissionCode);

        EmployeePermission ep = employeePermissionRepo.findByEmployee_Id(employeeId).stream()
                .filter(x -> x.getPermission().getCode().equals(permissionCode))
                .findFirst()
                .orElse(EmployeePermission.builder()
                        .employee(emp)
                        .permission(p)
                        .build());

        ep.setIsGranted(true);
        employeePermissionRepo.save(ep);

        Set<String> newPermissions = getPermissionsForEmployee(employeeId);

        String msg = "Quyền '<strong>" + p.getDescription() + "</strong>' đã được cấp.";
        realtimeService.sendUpdatedPermissions(employeeId, newPermissions, msg);
    }

    @Override
    @Transactional
    public void revokePermissionFromEmployee(Long employeeId, String permissionCode) {
        Employee emp = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee không tồn tại"));

        Permission p = permissionRepo.findByCode(permissionCode);
        if (p == null)
            throw new RuntimeException("Không tìm thấy permission: " + permissionCode);

        EmployeePermission ep = employeePermissionRepo.findByEmployee_Id(employeeId).stream()
                .filter(x -> x.getPermission().getCode().equals(permissionCode))
                .findFirst()
                .orElse(EmployeePermission.builder()
                        .employee(emp)
                        .permission(p)
                        .build());

        ep.setIsGranted(false);
        employeePermissionRepo.save(ep);

        Set<String> newPermissions = getPermissionsForEmployee(employeeId);

        String msg = "Quyền '<strong>" + p.getDescription() + "</strong>' bị thu hồi.";
        realtimeService.sendUpdatedPermissions(employeeId, newPermissions, msg);
    }

    @Override
    @Transactional
    public boolean hasPermission(Employee employee, String code) {
        Set<String> permissions = getPermissionsForEmployee(employee.getId());
        return permissions.contains(code);
    }



}