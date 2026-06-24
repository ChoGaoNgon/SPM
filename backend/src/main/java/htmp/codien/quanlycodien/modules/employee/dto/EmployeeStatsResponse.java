package htmp.codien.quanlycodien.modules.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeStatsResponse {
    private Long total;
    private Map<String, Long> statusCount;
}
