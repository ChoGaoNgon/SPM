package htmp.codien.quanlycodien.modules.newmodel.mp.dto.productMP;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MPTypeCheckDTO {
    String code;
    String description;
    String departmentCode;
    String parentDepartmentCode;
}
