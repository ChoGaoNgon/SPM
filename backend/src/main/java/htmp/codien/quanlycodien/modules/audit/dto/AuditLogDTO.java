package htmp.codien.quanlycodien.modules.audit.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDTO {
    private Long id;
    private String tableName;
    private String recordId;
    private String action;
    private LocalDateTime createdAt;
    private String createdBy;
    private List<AuditLogDetailDTO> details;
}