package htmp.codien.quanlycodien.modules.menu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMenuDTO {
    private String name;
    private String description;
    private String color;
}
