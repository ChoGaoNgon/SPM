package htmp.codien.quanlycodien.modules.audit.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import htmp.codien.quanlycodien.modules.audit.dto.AuditLogDetailDTO;
import htmp.codien.quanlycodien.modules.audit.dto.AuditLogRequestDTO;

public interface AuditService {
        void saveAuditLog(String tableName,
                        String recordId,
                        String action,
                        Map<String, Object> oldValues,
                        Map<String, Object> newValues,
                        String requestId);

        Page<AuditLogRequestDTO> getAuditRequests(String createdBy, String tableName, LocalDateTime startDate,
                        LocalDateTime endDate, Pageable pageable);

        List<AuditLogDetailDTO> getAuditDetailByRequestId(String requestId);

}
