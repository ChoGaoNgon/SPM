package htmp.codien.quanlycodien.modules.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CurrentWorkingEmployeeDTO {
    Long employeeId;
    String employeeCode;
    String employeeName;
    String positionName;
    String departmentName;
}
