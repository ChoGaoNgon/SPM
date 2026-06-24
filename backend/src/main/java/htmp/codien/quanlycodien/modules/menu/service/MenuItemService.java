package htmp.codien.quanlycodien.modules.menu.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.modules.department.entity.Department;
import htmp.codien.quanlycodien.modules.department.repository.DepartmentRepository;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.menu.dto.GroupMenuDTO;
import htmp.codien.quanlycodien.modules.menu.dto.MenuItemCreateRequest;
import htmp.codien.quanlycodien.modules.menu.dto.MenuItemDTO;
import htmp.codien.quanlycodien.modules.menu.entity.MenuItem;
import htmp.codien.quanlycodien.modules.menu.enums.GroupMenu;
import htmp.codien.quanlycodien.modules.menu.enums.SystemType;
import htmp.codien.quanlycodien.modules.menu.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public List<MenuItemDTO> getMenuTreeForCurrentUser() {
        Employee currentEmployee = SecurityUtils.getCurrentEmployee();
        Long employeeId = currentEmployee.getId();
        String role = currentEmployee.getRole().toString();
        String departmentCode = SecurityUtils.getCurrentDepartmentCode();
        Department parentDepartment = departmentRepository.findParentByDepartmentCode(departmentCode);
        String parentDepartmentCode = parentDepartment != null ? parentDepartment.getCode() : null;

        List<MenuItem> allMenuItems = menuItemRepository.findAllActiveAndVisible();

        List<MenuItem> filteredItems = allMenuItems.stream()
                .filter(item -> hasAccess(item, employeeId, role, departmentCode, parentDepartmentCode))
                .collect(Collectors.toList());

        return buildMenuTree(filteredItems);
    }

    @Transactional(readOnly = true)
    public List<MenuItemDTO> getAllMenuItems() {
        List<MenuItem> allMenuItems = menuItemRepository.findAll();
        return buildMenuTree(allMenuItems);
    }

    @Transactional(readOnly = true)
    public List<MenuItemDTO> getMenuBySystemType(SystemType systemType) {
        Employee currentEmployee = SecurityUtils.getCurrentEmployee();
        Long employeeId = currentEmployee.getId();
        String role = currentEmployee.getRole().toString();
        String departmentCode = SecurityUtils.getCurrentDepartmentCode();
        Department parentDepartment = departmentRepository.findParentByDepartmentCode(departmentCode);
        String parentDepartmentCode = parentDepartment != null ? parentDepartment.getCode() : null;

        List<MenuItem> allMenuItems = menuItemRepository.findAllActiveAndVisible();

        List<MenuItem> filteredItems = allMenuItems.stream()
                .filter(item -> item.getSystemType() == systemType)
                .filter(item -> hasAccess(item, employeeId, role, departmentCode, parentDepartmentCode))
                .collect(Collectors.toList());

        return buildMenuTree(filteredItems);
    }

    private boolean hasAccess(MenuItem item, Long employeeId, String role, String departmentCode,
            String parentDepartmentCode) {

        Boolean allowDept = false;
        Boolean allowRole = false;
        Boolean allowEmployee = false;

        List<Long> allowedEmployees = item.getAllowedEmployees();
        if (allowedEmployees != null && !allowedEmployees.isEmpty()) {
            if (allowedEmployees.contains(employeeId)) {
                allowEmployee = true;
            }
        }

        List<String> allowedDepartments = item.getAllowedDepartments();
        if (allowedDepartments != null && !allowedDepartments.isEmpty()) {
            if (!allowedDepartments.contains(departmentCode)) {
                allowDept = false;
            } else {
                allowDept = true;
            }
        }

        List<String> allowedRoles = item.getAllowedRoles();
        if (allowedRoles != null && !allowedRoles.isEmpty()) {
            if (allowedRoles.contains("ALL")) {
                allowRole = true;
            } else if (!allowedRoles.contains(role)) {
                allowRole = false;
            } else {
                allowRole = true;
            }
        }

        return allowEmployee || allowDept || allowRole;
    }

    private List<MenuItemDTO> buildMenuTree(List<MenuItem> items) {
        Map<Long, MenuItemDTO> itemMap = items.stream()
                .collect(Collectors.toMap(
                        MenuItem::getId,
                        this::convertToDTO));

        List<MenuItemDTO> roots = new ArrayList<>();

        for (MenuItem item : items) {
            MenuItemDTO dto = itemMap.get(item.getId());
            if (item.getParentId() == null) {
                roots.add(dto);
            } else {
                MenuItemDTO parent = itemMap.get(item.getParentId());
                if (parent != null) {
                    if (parent.getChildren() == null) {
                        parent.setChildren(new ArrayList<>());
                    }
                    parent.getChildren().add(dto);
                }
            }
        }

        return roots;
    }

    private MenuItemDTO convertToDTO(MenuItem item) {
        return MenuItemDTO.builder()
                .id(item.getId())
                .key(item.getMenuKey())
                .label(item.getLabel())
                .icon(item.getIcon())
                .parentId(item.getParentId())
                .displayOrder(item.getDisplayOrder())
                .systemType(item.getSystemType())
                .groupMenu(item.getGroupMenu())
                .allowedRoles(item.getAllowedRoles())
                .allowedDepartments(item.getAllowedDepartments())
                .allowedEmployees(item.getAllowedEmployees())
                .isActive(item.getIsActive())
                .isVisible(item.getIsVisible())
                .description(item.getDescription())
                .children(new ArrayList<>())
                .build();
    }

    @Transactional
    public MenuItem createMenuItem(MenuItemCreateRequest request) {
        MenuItem menuItem = MenuItem.builder()
                .menuKey(request.getMenuKey())
                .label(request.getLabel())
                .icon(request.getIcon())
                .parentId(request.getParentId())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .systemType(request.getSystemType() != null ? request.getSystemType() : SystemType.SYSTEM_2)
                .groupMenu(request.getGroupMenu())
                .allowedRoles(request.getAllowedRoles())
                .allowedDepartments(request.getAllowedDepartments())
                .allowedEmployees(request.getAllowedEmployees())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isVisible(request.getIsVisible() != null ? request.getIsVisible() : true)
                .description(request.getDescription())
                .build();
        return menuItemRepository.save(menuItem);
    }

    @Transactional
    public MenuItem updateMenuItem(Long id, MenuItemCreateRequest request) {
        MenuItem existing = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        existing.setMenuKey(request.getMenuKey());
        existing.setLabel(request.getLabel());
        existing.setIcon(request.getIcon());
        existing.setParentId(request.getParentId());
        existing.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        existing.setSystemType(request.getSystemType() != null ? request.getSystemType() : SystemType.SYSTEM_2);
        existing.setGroupMenu(request.getGroupMenu());
        existing.setAllowedRoles(request.getAllowedRoles());
        existing.setAllowedDepartments(request.getAllowedDepartments());
        existing.setAllowedEmployees(request.getAllowedEmployees());
        existing.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        existing.setIsVisible(request.getIsVisible() != null ? request.getIsVisible() : true);
        existing.setDescription(request.getDescription());

        return menuItemRepository.save(existing);
    }

    @Transactional
    public void deleteMenuItem(Long id) {
        menuItemRepository.deleteById(id);
    }

    public List<GroupMenuDTO> getAllGroupMenus() {
        return java.util.Arrays.stream(GroupMenu.values())
                .map(groupMenu -> GroupMenuDTO.builder()
                        .name(groupMenu.name())
                        .description(groupMenu.getDescription())
                        .color(groupMenu.getColor())
                        .build())
                .collect(Collectors.toList());
    }
}
