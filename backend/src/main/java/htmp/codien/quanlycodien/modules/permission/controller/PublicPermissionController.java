package htmp.codien.quanlycodien.modules.permission.controller;

import java.util.Set;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.permission.service.PermissionService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public/permissions")
@RequiredArgsConstructor
public class PublicPermissionController {
    private final PermissionService permissionService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<Set<String>>> getPermissionsByUserId(@PathVariable Long userId) {
        Set<String> permissions = permissionService.getPermissionsForEmployee(userId);
        return ResponseUtil.success(permissions, "Danh sách quyền của nhân viên");
    }
}
