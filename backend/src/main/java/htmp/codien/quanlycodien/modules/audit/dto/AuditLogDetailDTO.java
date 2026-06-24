package htmp.codien.quanlycodien.modules.audit.dto;

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
public class AuditLogDetailDTO {
    String requestId;
    String action;
    String recordId;
    String tableName;
    String fieldName;
    String oldValue;
    String newValue;
}