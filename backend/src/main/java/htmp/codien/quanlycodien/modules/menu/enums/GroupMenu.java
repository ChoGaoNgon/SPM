package htmp.codien.quanlycodien.modules.menu.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum GroupMenu {
    PRODUCTION_MANAGEMENT("Quản lý sản xuất", "#3B82F6", "Factory"),
    WAREHOUSE_MANAGEMENT("Quản lý Kho", "#F59E0B", "Package"),
    EQUIPMENT_ASSETS("Thiết bị và tài sản", "#10B981", "Wrench"),
    GENERAL_ADMINISTRATION("Hành chính tổng hợp", "#8B5CF6", "Briefcase"),
    SAFETY_OPERATIONS("An toàn và vận hành", "#EF4444", "ShieldCheck"),
    ACCOUNTING("Kế toán", "#64748B", "Calculator"),
    IT_MANAGEMENT("Quản lý phòng IT", "#EC4899", "ComputerDesktop"),
    QC("Quản lý chất lượng", "#EC4899", "ClipboardCheck");

    private final String description;
    private final String color;
    private final String icon;

}
