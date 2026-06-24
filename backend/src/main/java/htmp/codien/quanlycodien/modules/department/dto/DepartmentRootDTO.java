package htmp.codien.quanlycodien.modules.department.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DepartmentRootDTO {
    Long id;
    String code;
    String name;
    Integer subDepartmentCount;
    Integer employeeCount;
    List<DepartmentSubDTO> subDepartments;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class DepartmentSubDTO {
        Long id;
        String name;
        String code;
        Integer employeeCount;
    }
}