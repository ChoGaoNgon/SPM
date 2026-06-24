package htmp.codien.quanlycodien.modules.audit.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.audit.dto.AuditLogDetailDTO;
import htmp.codien.quanlycodien.modules.audit.dto.AuditLogRequestDTO;
import htmp.codien.quanlycodien.modules.audit.service.AuditService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {
    private final AuditService auditService;

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<Page<AuditLogRequestDTO>>> getAuditRequests(
            @RequestParam(required = false) String createdBy,
            @RequestParam(required = false) String tableName,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable) {

        Page<AuditLogRequestDTO> result = auditService.getAuditRequests(
                createdBy,
                tableName,
                startDate,
                endDate,
                pageable);

        return ResponseUtil.success(result, "Lấy danh sách request audit thành công");
    }

    @GetMapping("/requests/{requestId}")
    public ResponseEntity<ApiResponse<List<AuditLogDetailDTO>>> getAuditDetail(
            @PathVariable String requestId) {

        List<AuditLogDetailDTO> result = auditService.getAuditDetailByRequestId(requestId);

        return ResponseUtil.success(result, "Lấy chi tiết audit thành công");
    }
}
