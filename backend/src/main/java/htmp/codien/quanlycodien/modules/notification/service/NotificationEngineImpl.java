package htmp.codien.quanlycodien.modules.notification.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import htmp.codien.quanlycodien.common.enums.ApprovalLevel;
import htmp.codien.quanlycodien.modules.employee.enums.EmployeeStatus;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.employee.service.ApprovalLevelFinderHelper;
import htmp.codien.quanlycodien.modules.notification.dto.NotificationDTO;
import htmp.codien.quanlycodien.modules.notification.dto.TargetInput;
import htmp.codien.quanlycodien.modules.notification.entity.NotificationRule;
import htmp.codien.quanlycodien.modules.notification.entity.NotificationTemplate;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationEvent;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationTargetType;
import htmp.codien.quanlycodien.modules.notification.helper.NotificationHelper;
import htmp.codien.quanlycodien.modules.notification.repository.NotificationRuleRepository;
import htmp.codien.quanlycodien.modules.notification.repository.NotificationTemplateRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationEngineImpl implements NotificationEngine {
        private final NotificationTemplateRepository templateRepository;
        private final NotificationRuleRepository ruleRepository;
        private final NotificationService notificationService;
        private final ApprovalLevelFinderHelper approvalLevelFinderHelper;
        private final EmployeeRepository employeeRepository;

        @Override
        public void fire(NotificationEvent event, Map<String, Object> context) {

                NotificationTemplate template = templateRepository
                                .findByEventCodeAndIsActiveTrue(event.name())
                                .orElse(null);

                if (template == null) {
                        return;
                }

                NotificationRule rule = ruleRepository.findByEventCode(event.name()).orElse(null);

                if (rule == null || !Boolean.TRUE.equals(rule.getIsActive())) {
                        return;
                }

                List<TargetInput> targets = new ArrayList<>();

                if (rule.getTargetType() == NotificationTargetType.APPROVAL_LEVEL) {

                        Long employeeId = (Long) context.get("employeeId");
                        if (employeeId == null) {
                                return;
                        }

                        ApprovalLevel level = ApprovalLevel.valueOf(rule.getTargetValue());

                        List<String> managerIds = approvalLevelFinderHelper.findManagersByLevel(employeeId, level);

                        managerIds.forEach(mid -> targets.add(
                                        TargetInput.builder()
                                                        .type(NotificationTargetType.USER)
                                                        .value(mid)
                                                        .build()));
                } else if (rule.getTargetType() == NotificationTargetType.ALL) {

                        List<String> allEmployeeIds = employeeRepository
                                        .findByStatusIn(List.of(EmployeeStatus.ACTIVE))
                                        .stream()
                                        .map(e -> String.valueOf(e.getId()))
                                        .toList();

                        allEmployeeIds.forEach(mid -> targets.add(
                                        TargetInput.builder()
                                                        .type(NotificationTargetType.USER)
                                                        .value(mid)
                                                        .build()));
                } else {

                        targets.add(
                                        TargetInput.builder()
                                                        .type(rule.getTargetType())
                                                        .value(rule.getTargetValue())
                                                        .build());
                }

                String title = NotificationHelper.templateRender(
                                template.getTitleTemplate(), context);

                String message = NotificationHelper.templateRender(
                                template.getMessageTemplate(), context);

                String url = NotificationHelper.templateRender(
                                template.getUrlTemplate(), context);

                notificationService.sendNotificationTarget(
                                NotificationDTO.builder()
                                                .title(title)
                                                .message(message)
                                                .type(template.getNotificationType())
                                                .url(url)
                                                .targets(targets)
                                                .context(context)
                                                .build());
        }
}
