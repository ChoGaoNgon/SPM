package htmp.codien.quanlycodien.modules.audit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import htmp.codien.quanlycodien.modules.audit.dto.AuditLogDetailDTO;
import htmp.codien.quanlycodien.modules.audit.entity.AuditLogDetail;

public interface AuditLogDetailRepository extends JpaRepository<AuditLogDetail, Long> {

    @Query("""
            SELECT new htmp.codien.quanlycodien.modules.audit.dto.AuditLogDetailDTO(
                al.requestId,
                al.action,
                al.recordId,
                al.tableName,
                ald.fieldName,
                ald.oldValue,
                ald.newValue
            )
            FROM AuditLogDetail ald
            JOIN ald.auditLog al
            WHERE al.requestId = :requestId
            ORDER BY al.createdAt, al.id, ald.id
            """)
    List<AuditLogDetailDTO> findByRequestId(String requestId);
}
