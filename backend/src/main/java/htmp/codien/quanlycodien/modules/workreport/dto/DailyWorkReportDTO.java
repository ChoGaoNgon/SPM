package htmp.codien.quanlycodien.modules.workreport.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class DailyWorkReportDTO {
    private Long id;
    private LocalDate reportDate;
    private String taskDescription;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private String filePath;
    private Long employeeId;
    private String employeeCode;
    private String employeeName;
}