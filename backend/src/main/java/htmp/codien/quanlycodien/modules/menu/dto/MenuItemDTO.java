package htmp.codien.quanlycodien.modules.menu.dto;

import java.util.List;

import htmp.codien.quanlycodien.modules.menu.enums.GroupMenu;
import htmp.codien.quanlycodien.modules.menu.enums.SystemType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemDTO {
    private Long id;
    private String key;
    private String label;
    private String icon;
    private Long parentId;
    private Integer displayOrder;
    private SystemType systemType;
    private GroupMenu groupMenu;
    private List<String> allowedRoles;
    private List<String> allowedDepartments;
    private List<Long> allowedEmployees;
    private Boolean isActive;
    private Boolean isVisible;
    private String description;
    private List<MenuItemDTO> children;
}
