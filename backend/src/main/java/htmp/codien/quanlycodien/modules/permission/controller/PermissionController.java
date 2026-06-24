package htmp.codien.quanlycodien.modules.permission.controller;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.modules.employee.dto.EmployeeResponse;
import htmp.codien.quanlycodien.modules.permission.entity.Permission;
import htmp.codien.quanlycodien.modules.permission.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionController {
    private final PermissionService permissionService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Permission>> createPermission(@RequestBody Permission request) {
        Permission perm = permissionService.createPermission(request.getCode(), request.getDescription());
        return ResponseUtil.success(perm, "Tạo quyền thành công");
    }

    @PatchMapping("/{code}")
    public ResponseEntity<ApiResponse<Permission>> updatePermission(
            @PathVariable String code,
            @RequestBody Permission request) {
        Permission updated = permissionService.updatePermission(code, request.getDescription());
        return ResponseUtil.success(updated, "Cập nhật quyền thành công");
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<ApiResponse<String>> deletePermission(@PathVariable String code) {
        permissionService.deletePermission(code);
        return ResponseUtil.success(null, "Xóa quyền thành công");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Permission>>> getAllPermissions() {
        List<Permission> permissions = permissionService.getAllPermissions();
        return ResponseUtil.success(permissions, "Danh sách quyền");
    }

    @PostMapping("/role/{role}/assign")
    public ResponseEntity<ApiResponse<String>> assignToRole(
            @PathVariable Role role,
            @RequestBody Permission request) {
        permissionService.assignPermissionToRole(role, request.getCode());
        return ResponseUtil.success(null, "Đã gán quyền " + request.getCode() + " cho role " + role.name());
    }

    @PostMapping("/role/{role}/revoke")
    public ResponseEntity<ApiResponse<String>> revokeFromRole(
            @PathVariable Role role,
            @RequestBody Permission request) {
        permissionService.revokePermissionFromRole(role, request.getCode());
        return ResponseUtil.success(null, "Đã thu hồi quyền " + request.getCode() + " khỏi role " + role.name());
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponse<Set<String>>> getPermissionsByRole(@PathVariable Role role) {
        Set<String> rolePermissions = permissionService.getPermissionsByRole(role);
        return ResponseUtil.success(rolePermissions, "Danh sách quyền của role " + role.name());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<Set<String>>> getPermissionsByRole(@PathVariable Long employeeId) {
        Set<String> rolePermissions = permissionService.getPermissionsForEmployee(employeeId);
        return ResponseUtil.success(rolePermissions, "Danh sách quyền của nhân viên");
    }

    @GetMapping("/code/{code}/employees")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getEmployeesByPermission(@PathVariable String code) {
        List<EmployeeResponse> employees = permissionService.getEmployeesByPermission(code);
        return ResponseUtil.success(employees, "Danh sách nhân viên theo quyền " + code);
    }

    @PostMapping("/employee/{id}/grant")
    public ResponseEntity<ApiResponse<String>> grantToEmployee(
            @PathVariable Long id,
            @RequestBody Permission request) {
        permissionService.grantPermissionToEmployee(id, request.getCode());
        return ResponseUtil.success(null, "Đã gán quyền " + request.getCode() + " cho nhân viên " + id);
    }

    @PostMapping("/employee/{id}/revoke")
    public ResponseEntity<ApiResponse<String>> revokeFromEmployee(
            @PathVariable Long id,
            @RequestBody Permission request) {
        permissionService.revokePermissionFromEmployee(id, request.getCode());
        return ResponseUtil.success(null, "Đã thu hồi quyền " + request.getCode() + " khỏi nhân viên " + id);
    }
}