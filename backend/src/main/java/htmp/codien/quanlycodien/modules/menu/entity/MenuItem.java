package htmp.codien.quanlycodien.modules.menu.entity;

import java.util.List;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.common.LongListConverter;
import htmp.codien.quanlycodien.common.StringListConverter;
import htmp.codien.quanlycodien.modules.menu.enums.GroupMenu;
import htmp.codien.quanlycodien.modules.menu.enums.GroupMenuConverter;
import htmp.codien.quanlycodien.modules.menu.enums.SystemType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "menu_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class MenuItem extends BaseEntity {
    @Column(name = "menu_key", nullable = false, unique = true)
    private String menuKey;

    @Column(nullable = false)
    private String label;

    @Column(length = 50)
    private String icon;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "system_type", length = 20, nullable = false)
    @Builder.Default
    private SystemType systemType = SystemType.SYSTEM_2;

    @Column(name = "allowed_roles", columnDefinition = "LONGTEXT")
    @Convert(converter = StringListConverter.class)
    private List<String> allowedRoles;

    @Column(name = "allowed_departments", columnDefinition = "LONGTEXT")
    @Convert(converter = StringListConverter.class)
    private List<String> allowedDepartments;

    @Column(name = "allowed_employees", columnDefinition = "LONGTEXT")
    @Convert(converter = LongListConverter.class)
    private List<Long> allowedEmployees;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_visible")
    @Builder.Default
    private Boolean isVisible = true;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "group_menu")
    @Convert(converter = GroupMenuConverter.class)
    private GroupMenu groupMenu;
}
