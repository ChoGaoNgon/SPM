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
import htmp.codien.quanlycodien.modules.notification.dto.NotificationRuleRequest;
import htmp.codien.quanlycodien.modules.notification.dto.NotificationRuleResponse;
import htmp.codien.quanlycodien.modules.notification.service.NotificationRuleService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notification/rules")
@RequiredArgsConstructor
public class NotificationRuleController {
    private final NotificationRuleService notificationRuleService;

    @GetMapping

    public ResponseEntity<ApiResponse<List<NotificationRuleResponse>>> getAll() {
        List<NotificationRuleResponse> rules = notificationRuleService.getAll();
        return ResponseUtil.success(rules, "Lấy danh sách quy tắc thông báo thành công");
    }

    @GetMapping("/{id}")

    public ResponseEntity<ApiResponse<NotificationRuleResponse>> getById(@PathVariable Long id) {
        NotificationRuleResponse rule = notificationRuleService.getById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NotificationRule not found with id: " + id));
        return ResponseUtil.success(rule, "Lấy quy tắc thông báo thành công");
    }

    @PostMapping

    public ResponseEntity<ApiResponse<NotificationRuleResponse>> create(
            @RequestBody NotificationRuleRequest request) {
        NotificationRuleResponse rule = notificationRuleService.create(request);
        return ResponseUtil.created(rule, "Tạo quy tắc thông báo thành công");
    }

    @PutMapping("/{id}")

    public ResponseEntity<ApiResponse<NotificationRuleResponse>> update(
            @PathVariable Long id,
            @RequestBody NotificationRuleRequest request) {
        NotificationRuleResponse rule = notificationRuleService.update(id, request);
        return ResponseUtil.success(rule, "Cập nhật quy tắc thông báo thành công");
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        notificationRuleService.delete(id);
        return ResponseUtil.success(null, "Xóa quy tắc thông báo thành công");
    }
}
