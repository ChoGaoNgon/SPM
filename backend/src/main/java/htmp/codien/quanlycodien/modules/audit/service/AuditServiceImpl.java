package htmp.codien.quanlycodien.modules.audit.service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.modules.audit.dto.AuditLogDetailDTO;
import htmp.codien.quanlycodien.modules.audit.dto.AuditLogRequestDTO;
import htmp.codien.quanlycodien.modules.audit.entity.AuditLog;
import htmp.codien.quanlycodien.modules.audit.entity.AuditLogDetail;
import htmp.codien.quanlycodien.modules.audit.repository.AuditLogDetailRepository;
import htmp.codien.quanlycodien.modules.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {
    private final AuditLogRepository auditLogRepository;
    private final AuditLogDetailRepository auditLogDetailRepository;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveAuditLog(String tableName, String recordId, String action, Map<String, Object> oldValues,
            Map<String, Object> newValues, String requestId) {
        AuditLog auditLog = new AuditLog();
        auditLog.setTableName(tableName);
        auditLog.setRecordId(recordId);
        auditLog.setAction(action);
        auditLog.setRequestId(requestId);

        
        Set<String> allFields = new HashSet<>();
        if (oldValues != null) {
            allFields.addAll(oldValues.keySet());
        }
        if (newValues != null) {
            allFields.addAll(newValues.keySet());
        }

        
        for (String field : allFields) {

            AuditLogDetail detail = new AuditLogDetail();

            detail.setAuditLog(auditLog);
            detail.setFieldName(field);

            Object oldVal = oldValues != null ? oldValues.get(field) : null;
            Object newVal = newValues != null ? newValues.get(field) : null;

            detail.setOldValue(oldVal == null ? null : oldVal.toString());
            detail.setNewValue(newVal == null ? null : newVal.toString());

            auditLog.addDetail(detail);
        }

        auditLogRepository.save(auditLog);
    }

    @Override
    public Page<AuditLogRequestDTO> getAuditRequests(String createdBy, String tableName, LocalDateTime startDate,
            LocalDateTime endDate, Pageable pageable) {
        
        Page<String> requestIdPage = auditLogRepository.findRequestIds(
                createdBy, tableName, startDate, endDate, pageable);

        List<String> requestIds = requestIdPage.getContent();

        if (requestIds.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }

        
        List<Object[]> rows = auditLogRepository.findByRequestIds(requestIds);

        
        Map<String, AuditLogRequestDTO> map = new LinkedHashMap<>();

        for (Object[] row : rows) {
            String requestId = (String) row[0];
            String tableNameRow = (String) row[1];

            Timestamp ts = (Timestamp) row[2];
            LocalDateTime createdAt = ts != null ? ts.toLocalDateTime() : null;

            String createdByRow = (String) row[3];
            String employeeName = (String) row[4];
            String departmentName = (String) row[5];

            map.computeIfAbsent(requestId, k -> AuditLogRequestDTO.builder()
                    .requestId(requestId)
                    .tableNames(new ArrayList<>())
                    .createdAt(createdAt)
                    .createdBy(createdByRow)
                    .employeeName(employeeName)
                    .departmentName(departmentName)
                    .build());

            AuditLogRequestDTO dto = map.get(requestId);

            
            if (createdAt != null && dto.getCreatedAt() != null && createdAt.isBefore(dto.getCreatedAt())) {
                dto.setCreatedAt(createdAt);
            }

            if (!dto.getTableNames().contains(tableNameRow)) {
                dto.getTableNames().add(tableNameRow);
            }
        }

        
        List<AuditLogRequestDTO> content = requestIds.stream()
                .map(map::get)
                .filter(Objects::nonNull)
                .toList();

        return new PageImpl<>(content, pageable, requestIdPage.getTotalElements());
    }

    @Override
    public List<AuditLogDetailDTO> getAuditDetailByRequestId(String requestId) {
        return auditLogDetailRepository.findByRequestId(requestId);
    }
}
