package htmp.codien.quanlycodien.modules.workreport.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeeWorkReportDTO {
    Long employeeId;
    String employeeCode;
    String employeeName;
    String departmentName;
    String positionName;
    LocalDateTime startDateTime;
    LocalDateTime endDateTime;
    LocalDateTime checkinTime;
    LocalDateTime checkoutTime;
    double workEfficiency;
    List<DailyWorkReportItemDTO> reports;
}
