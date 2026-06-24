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
public class AuditLogSearchDTO {

    private String keyword;
    private String tableName;
    private String recordId;
    private String action;
    private List<String> actions;
    private String createdBy;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private List<String> tableNames;
    private List<String> excludeTableNames;
    private Boolean hasDetailsOnly;
    private Boolean todayOnly;
}