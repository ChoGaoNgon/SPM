package htmp.codien.quanlycodien.modules.notification.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.modules.notification.dto.NotificationTemplateRequest;
import htmp.codien.quanlycodien.modules.notification.dto.NotificationTemplateResponse;
import htmp.codien.quanlycodien.modules.notification.service.NotificationTemplateService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notification/templates")
@RequiredArgsConstructor
public class NotificationTemplateController {
    private final NotificationTemplateService notificationTemplateService;

    @GetMapping

    public ResponseEntity<ApiResponse<List<NotificationTemplateResponse>>> getAll() {
        List<NotificationTemplateResponse> templates = notificationTemplateService.getAll();
        return ResponseUtil.success(templates, "Lấy danh sách mẫu thông báo thành công");
    }

    @GetMapping("/{id}")

    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> getById(@PathVariable Long id) {
        NotificationTemplateResponse template = notificationTemplateService.getById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NotificationTemplate not found with id: " + id));
        return ResponseUtil.success(template, "Lấy mẫu thông báo thành công");
    }

    @PostMapping

    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> create(
            @RequestBody NotificationTemplateRequest request) {
        NotificationTemplateResponse template = notificationTemplateService.create(request);
        return ResponseUtil.created(template, "Tạo mẫu thông báo thành công");
    }

    @PutMapping("/{id}")

    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> update(
            @PathVariable Long id,
            @RequestBody NotificationTemplateRequest request) {
        NotificationTemplateResponse template = notificationTemplateService.update(id, request);
        return ResponseUtil.success(template, "Cập nhật mẫu thông báo thành công");
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        notificationTemplateService.delete(id);
        return ResponseUtil.success(null, "Xóa mẫu thông báo thành công");
    }
}
