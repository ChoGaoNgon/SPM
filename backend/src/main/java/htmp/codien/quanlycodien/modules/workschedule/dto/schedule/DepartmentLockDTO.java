package htmp.codien.quanlycodien.modules.workschedule.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class DepartmentLockDTO {
    private Long id;
    private String name;
    private boolean locked;
}