package htmp.codien.quanlycodien.modules.workschedule.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum BreakType {
    MORNING("Bữa sáng"),
    LUNCH("Bữa trưa"),
    DINNER("Bữa tối"),
    OTHER("Khác");

    private final String description;
}