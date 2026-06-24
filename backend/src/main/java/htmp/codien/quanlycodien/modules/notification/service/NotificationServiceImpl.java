package htmp.codien.quanlycodien.modules.notification.service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.infrastructure.config.AuditUserContext;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.enums.EmployeeStatus;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.notification.dto.NotificationDTO;
import htmp.codien.quanlycodien.modules.notification.dto.NotificationReceiverDTO;
import htmp.codien.quanlycodien.modules.notification.dto.TargetInput;
import htmp.codien.quanlycodien.modules.notification.entity.Notification;
import htmp.codien.quanlycodien.modules.notification.entity.NotificationReceiver;
import htmp.codien.quanlycodien.modules.notification.entity.NotificationTarget;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationType;
import htmp.codien.quanlycodien.modules.notification.repository.NotificationReceiverRepository;
import htmp.codien.quanlycodien.modules.notification.repository.NotificationRepository;
import htmp.codien.quanlycodien.modules.notification.repository.NotificationTargetRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationTargetRepository targetRepository;
    private final NotificationReceiverRepository receiverRepository;
    private final EmployeeRepository employeeRepository;
    private final RestTemplate restTemplate;

    @Value("${realtime.server.url}")
    private String realtimeServerUrl;

    @Override
    @Transactional
    public void sendNotificationTarget(NotificationDTO req) {
        Map<String, Object> context = new HashMap<>();
        if (req.getContext() instanceof Map<?, ?>) {
            @SuppressWarnings("unchecked")
            Map<String, Object> contextMap = (Map<String, Object>) req.getContext();
            context.putAll(contextMap);
        }

        String updateBy = (String) context.get("employeeCode");
        AuditUserContext.setCurrentAuditor(updateBy);

        try {
            Notification notification = Notification.builder()
                    .title(req.getTitle())
                    .message(req.getMessage())
                    .type(req.getType())
                    .url(req.getUrl())
                    .updatedBy(updateBy)
                    .build();

            notificationRepository.save(notification);

            Set<Long> receiverIds = new HashSet<>();

            for (TargetInput input : req.getTargets()) {
                targetRepository.save(NotificationTarget.builder()
                        .notification(notification)
                        .targetType(input.getType())
                        .targetValue(input.getValue())
                        .build());

                List<Long> ids;
                switch (input.getType()) {
                    case ALL: {
                        ids = employeeRepository.findAll().stream()
                                .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE
                                        || e.getStatus() == EmployeeStatus.PROBATION)
                                .map(Employee::getId)
                                .toList();
                        break;
                    }
                    case DEPARTMENT: {
                        List<String> deptCodes = List.of(input.getValue().split(",")).stream()
                                .map(String::trim)
                                .filter(s -> !s.isEmpty())
                                .toList();
                        ids = deptCodes.isEmpty()
                                ? List.of()
                                : employeeRepository
                                        .findByDepartmentCodesAndStatuses(deptCodes,
                                                List.of(EmployeeStatus.ACTIVE, EmployeeStatus.PROBATION))
                                        .stream()
                                        .map(Employee::getId)
                                        .toList();
                        break;
                    }
                    case ROLE: {
                        List<String> roleNames = List.of(input.getValue().split(",")).stream()
                                .map(String::trim)
                                .filter(s -> !s.isEmpty())
                                .toList();
                        ids = roleNames.stream()
                                .flatMap(rn -> {
                                    try {
                                        Role role = Role.valueOf(rn);
                                        return employeeRepository.findByRole(role).stream();
                                    } catch (IllegalArgumentException ex) {
                                        return java.util.stream.Stream.empty();
                                    }
                                })
                                .map(Employee::getId)
                                .toList();
                        break;
                    }
                    case USER: {
                        ids = List.of(input.getValue().split(",")).stream()
                                .map(String::trim)
                                .filter(s -> !s.isEmpty())
                                .map(Long::parseLong)
                                .toList();
                        break;
                    }
                    case DYNAMIC: {

                        String targetCode = context.containsKey("responsibleEmployeeCode")
                                ? (String) context.get("responsibleEmployeeCode")
                                : (String) context.get("createdBy");
                        ids = employeeRepository.findByCode(targetCode).stream()
                                .map(Employee::getId)
                                .toList();
                        break;
                    }
                    default: {
                        ids = List.of();
                    }
                }

                receiverIds.addAll(ids);
            }

            receiverIds.forEach(uid -> receiverRepository.save(
                    NotificationReceiver.builder()
                            .notification(notification)
                            .employeeId(uid)
                            .isRead(false)
                            .build()));

            pushRealtime(notification, receiverIds);
        } finally {
            AuditUserContext.clear();
        }
    }

    private void pushRealtime(Notification notification, Set<Long> receiverIds) {
        if (receiverIds.isEmpty())
            return;

        Map<Long, Long> unreadCounts = receiverIds.stream()
                .collect(Collectors.toMap(
                        uid -> uid,
                        uid -> receiverRepository.countByEmployeeIdAndIsReadFalse(uid)));

        Map<String, Object> payload = new HashMap<>();
        payload.put("notificationId", notification.getId());
        payload.put("type", notification.getType());
        payload.put("title", notification.getTitle());
        payload.put("message", notification.getMessage());
        payload.put("url", notification.getUrl());
        payload.put("receivers", receiverIds);
        payload.put("unreadCounts", unreadCounts);

        restTemplate.postForObject(
                realtimeServerUrl + "/notification",
                payload,
                String.class);
    }

    @Override
    public Long getQuantityUnreadNotification(Long employeeId) {
        return receiverRepository.countByEmployeeIdAndIsReadFalse(employeeId);
    }

    @Override
    public List<NotificationReceiverDTO> get10Notification(Long employeeId) {
        return convertObjectToDTO(
                receiverRepository.findTop10NotificationWithReceiverByEmployeeId(employeeId));
    }

    @Override
    public List<NotificationReceiverDTO> getAllNotification(Long employeeId) {
        return convertObjectToDTO(
                receiverRepository.findAllNotificationWithReceiverByEmployeeId(employeeId));
    }

    private List<NotificationReceiverDTO> convertObjectToDTO(List<Object[]> results) {
        return results.stream()
                .map(r -> NotificationReceiverDTO.builder()
                        .notificationId(((Number) r[0]).longValue())
                        .title((String) r[1])
                        .message((String) r[2])
                        .type(NotificationType.valueOf((String) r[3]))
                        .url((String) r[4])
                        .isRead((Boolean) r[5])
                        .createdAt(((java.sql.Timestamp) r[6]).toLocalDateTime())
                        .departmentName((String) r[7])
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public void markAsRead(Long notificationId, Long employeeId) {
        NotificationReceiver receiver = receiverRepository
                .findByNotificationIdAndEmployeeId(notificationId, employeeId)
                .orElseThrow(() -> new RuntimeException("Thông báo này không tồn tại"));
        receiver.setRead(true);
        receiverRepository.save(receiver);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long employeeId) {
        receiverRepository.markAllAsReadByEmployeeId(employeeId);
    }
}
