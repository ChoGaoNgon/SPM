package htmp.codien.quanlycodien.modules.audit.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class AuditLogRequestDTO {
    String requestId;
    List<String> tableNames;
    LocalDateTime createdAt;
    String createdBy;
    String employeeName;
    String departmentName;
}
