package htmp.codien.quanlycodien.modules.menu.dto;

import java.util.List;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import htmp.codien.quanlycodien.modules.menu.enums.GroupMenu;
import htmp.codien.quanlycodien.modules.menu.enums.GroupMenuDeserializer;
import htmp.codien.quanlycodien.modules.menu.enums.SystemType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItemCreateRequest {
    private String menuKey;
    private String label;
    private String icon;
    private Long parentId;
    private Integer displayOrder;
    private SystemType systemType;
    private List<String> allowedRoles;
    private List<String> allowedDepartments;
    private List<Long> allowedEmployees;
    private Boolean isActive;
    private Boolean isVisible;
    private String description;

    @JsonDeserialize(using = GroupMenuDeserializer.class)
    private GroupMenu groupMenu;
}
