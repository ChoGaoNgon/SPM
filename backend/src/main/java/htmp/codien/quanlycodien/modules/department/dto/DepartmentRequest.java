package htmp.codien.quanlycodien.modules.department.dto;

import lombok.Data;

@Data
public class DepartmentRequest {
    private String name;
    private String code;
    private Long parentDepartmentId;
}