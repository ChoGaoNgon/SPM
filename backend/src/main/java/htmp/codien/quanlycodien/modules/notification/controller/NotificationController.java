package htmp.codien.quanlycodien.modules.notification.controller;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.notification.dto.NotificationEventResponse;
import htmp.codien.quanlycodien.modules.notification.dto.NotificationReceiverDTO;
import htmp.codien.quanlycodien.modules.notification.dto.NotificationTypeResponse;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationEvent;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationType;
import htmp.codien.quanlycodien.modules.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{employeeId}/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@PathVariable Long employeeId) {
        Long count = notificationService.getQuantityUnreadNotification(employeeId);
        return ResponseUtil.success(count, "Số lượng thông báo chưa đọc cho nhân viên " + employeeId);
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<ApiResponse<List<NotificationReceiverDTO>>> get10Notification(@PathVariable Long employeeId) {
        List<NotificationReceiverDTO> result = notificationService.get10Notification(employeeId);

        return ResponseUtil.success(result, "Lấy 10 thông báo cho nhân viên có id: " + employeeId + " thành công");
    }

    @GetMapping("/all/{employeeId}")
    public ResponseEntity<ApiResponse<List<NotificationReceiverDTO>>> getAllNotification(
            @PathVariable Long employeeId) {
        List<NotificationReceiverDTO> result = notificationService.getAllNotification(employeeId);

        return ResponseUtil.success(result, "Lấy tất cả thông báo cho nhân viên có id: " + employeeId + " thành công");
    }

    @PatchMapping("/{employeeId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long employeeId,
            @RequestParam Long notificationId) {
        notificationService.markAsRead(notificationId, employeeId);
        return ResponseUtil.success(null, "Đã đánh dấu thông báo là đã đọc");
    }

    @PatchMapping("/{employeeId}/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@PathVariable Long employeeId) {
        notificationService.markAllAsRead(employeeId);
        return ResponseUtil.success(null, "Đã đánh dấu tất cả thông báo là đã đọc");
    }

    @GetMapping("/events")
    public ResponseEntity<ApiResponse<Map<String, List<NotificationEventResponse>>>> getAllEvents() {
        Map<String, List<NotificationEventResponse>> events = Arrays.stream(NotificationEvent.values())
                .collect(Collectors.groupingBy(
                        NotificationEvent::getGroup,
                        LinkedHashMap::new,
                        Collectors.mapping(
                                e -> new NotificationEventResponse(e.name(), e.getDescription()),
                                Collectors.toList())));

        return ResponseUtil.success(events, "Lấy danh sách event thông báo thành công");
    }

    @GetMapping("/types")
    public ResponseEntity<ApiResponse<List<NotificationTypeResponse>>> getAllTypes() {
        List<NotificationTypeResponse> types = Arrays.stream(NotificationType.values())
                .map(t -> new NotificationTypeResponse(t.name(), t.getDescription()))
                .collect(Collectors.toList());

        return ResponseUtil.success(types, "Lấy danh sách loại thông báo thành công");
    }
}
