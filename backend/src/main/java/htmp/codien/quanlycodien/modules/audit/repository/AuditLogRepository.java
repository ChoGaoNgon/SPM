package htmp.codien.quanlycodien.modules.audit.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.audit.entity.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {

    @Query(value = """
                SELECT al.requestId
                FROM AuditLog al
                WHERE (:createdBy IS NULL OR al.createdBy = :createdBy)
                  AND (:tableName IS NULL OR al.tableName = :tableName)
                  AND (:startDate IS NULL OR al.createdAt >= :startDate)
                  AND (:endDate IS NULL OR al.createdAt <= :endDate)
                GROUP BY al.requestId
                ORDER BY MAX(al.createdAt) DESC
            """, countQuery = """
                SELECT COUNT(DISTINCT al.requestId)
                FROM AuditLog al
                WHERE (:createdBy IS NULL OR al.createdBy = :createdBy)
                  AND (:tableName IS NULL OR al.tableName = :tableName)
                  AND (:startDate IS NULL OR al.createdAt >= :startDate)
                  AND (:endDate IS NULL OR al.createdAt <= :endDate)
            """)
    Page<String> findRequestIds(
            @Param("createdBy") String createdBy,
            @Param("tableName") String tableName,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    @Query(value = """
                SELECT
                    al.request_id,
                    JSON_ARRAYAGG(DISTINCT al.table_name) AS table_names,
                    MIN(al.created_at) AS created_at,
                    MIN(al.created_by) AS created_by,
                    e.name AS employee_name,
                    d.name AS department_name
                FROM audit_logs as al
                JOIN employees e ON e.code = al.created_by
                JOIN departments d ON d.id = e.department_id
                WHERE al.request_id IN (:requestIds)
                GROUP BY al.request_id
                ORDER BY MIN(al.created_at) DESC
            """, nativeQuery = true)
    List<Object[]> findByRequestIds(@Param("requestIds") List<String> requestIds);
}