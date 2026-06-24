package htmp.codien.quanlycodien.modules.workreport.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class DailyWorkReportItemDTO {
    Long id;
    LocalDate reportDate;
    String taskDescription;
    LocalDateTime startDateTime;
    LocalDateTime endDateTime;
    String filePath;
    LocalDateTime createdAt;
}