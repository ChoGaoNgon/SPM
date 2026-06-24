package htmp.codien.quanlycodien.modules.menu.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.menu.dto.GroupMenuDTO;
import htmp.codien.quanlycodien.modules.menu.dto.MenuItemCreateRequest;
import htmp.codien.quanlycodien.modules.menu.dto.MenuItemDTO;
import htmp.codien.quanlycodien.modules.menu.entity.MenuItem;
import htmp.codien.quanlycodien.modules.menu.enums.SystemType;
import htmp.codien.quanlycodien.modules.menu.service.MenuItemService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MenuItemDTO>>> getMenuForCurrentUser() {
        List<MenuItemDTO> menus = menuItemService.getMenuTreeForCurrentUser();
        return ResponseUtil.success(menus, "Lấy menu thành công");
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<MenuItemDTO>>> getAllMenuItems() {
        List<MenuItemDTO> menus = menuItemService.getAllMenuItems();
        return ResponseUtil.success(menus, "Lấy tất cả menu thành công");
    }

    @GetMapping("/groups")
    public ResponseEntity<ApiResponse<List<GroupMenuDTO>>> getAllGroupMenus() {
        List<GroupMenuDTO> groupMenus = menuItemService.getAllGroupMenus();
        return ResponseUtil.success(groupMenus, "Lấy danh sách nhóm menu thành công");
    }

    @GetMapping("/system/{systemType}")
    public ResponseEntity<ApiResponse<List<MenuItemDTO>>> getMenuBySystemType(@PathVariable SystemType systemType) {
        List<MenuItemDTO> menus = menuItemService.getMenuBySystemType(systemType);
        return ResponseUtil.success(menus, "Lấy menu hệ thống " + systemType + " thành công");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MenuItem>> createMenuItem(@RequestBody MenuItemCreateRequest request) {
        MenuItem created = menuItemService.createMenuItem(request);
        return ResponseUtil.success(created, "Tạo menu thành công");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MenuItem>> updateMenuItem(
            @PathVariable Long id,
            @RequestBody MenuItemCreateRequest request) {
        MenuItem updated = menuItemService.updateMenuItem(id, request);
        return ResponseUtil.success(updated, "Cập nhật menu thành công");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(@PathVariable Long id) {
        menuItemService.deleteMenuItem(id);
        return ResponseUtil.success(null, "Xóa menu thành công");
    }
}
