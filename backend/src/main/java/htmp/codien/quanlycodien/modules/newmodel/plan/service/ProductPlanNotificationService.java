package htmp.codien.quanlycodien.modules.newmodel.plan.service;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanApproval;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationEvent;
import htmp.codien.quanlycodien.modules.notification.service.NotificationTriggerEvent;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductPlanNotificationService {

    private final ApplicationEventPublisher applicationEventPublisher;
    private final EmployeeRepository employeeRepository;

    public void sendNotification(NotificationEvent event, ProductPlan plan) {
        sendNotification(event, plan, null);
    }

    public void sendNotification(NotificationEvent event, ProductPlan plan, ProductPlanApproval approval) {
        Employee current = SecurityUtils.getCurrentEmployee();
        Map<String, Object> payload = buildPayload(plan, approval, current);
        applicationEventPublisher.publishEvent(new NotificationTriggerEvent(event, payload));
    }

    public void sendApprovalNotifications(NotificationEvent approvedEvent,
            NotificationEvent waitingEvent,
            ProductPlan plan,
            ProductPlanApproval currentApproval) {
        Employee current = SecurityUtils.getCurrentEmployee();
        Map<String, Object> payload = buildPayload(plan, currentApproval, current);

        applicationEventPublisher.publishEvent(new NotificationTriggerEvent(approvedEvent, payload));

        if (waitingEvent != null) {
            applicationEventPublisher.publishEvent(new NotificationTriggerEvent(waitingEvent, payload));
        }
    }

    private Map<String, Object> buildPayload(ProductPlan plan, ProductPlanApproval approval, Employee current) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("planId", plan.getId());
        payload.put("modelId", resolveModelId(plan));
        payload.put("productId", resolveProductId(plan));
        payload.put("productCode", resolveProductCode(plan));
        payload.put("planName", plan.getName());
        payload.put("planType", buildPlanTypeLabel(plan.getTypePlan()));
        payload.put("dynamic", resolveResponsibleId(plan));
        payload.put("approvalType", approval != null ? approval.getApprovalType() : null);
        payload.put("approvalTypeName", approval != null ? approval.getApprovalTypeName() : null);
        payload.put("employeeCode", current != null ? current.getCode() : "SYSTEM");
        payload.put("employeeName", current != null ? current.getName() : "SYSTEM");

        payload.put("createdBy", plan.getCreatedBy());
        payload.put("responsibleEmployeeCode", resolveResponsibleCode(plan));
        return payload;
    }

    private String resolveResponsibleCode(ProductPlan plan) {
        try {
            Employee responsible = plan.getResponsibleEmployee();
            if (responsible != null) {
                Long responsibleId = responsible.getId();
                if (responsibleId != null) {
                    return employeeRepository.findById(responsibleId)
                            .map(Employee::getCode)
                            .orElse(plan.getCreatedBy());
                }
            }
        } catch (Exception ignored) {
        }
        return plan.getCreatedBy();
    }

    private Long resolveResponsibleId(ProductPlan plan) {
        try {
            return plan.getResponsibleEmployee() != null ? plan.getResponsibleEmployee().getId() : null;
        } catch (Exception ignored) {
            return null;
        }
    }

    private Long resolveProductId(ProductPlan plan) {
        try {
            return plan.getProduct() != null ? plan.getProduct().getId() : null;
        } catch (Exception ignored) {
            return null;
        }
    }

    private String resolveProductCode(ProductPlan plan) {
        try {
            return plan.getProduct() != null ? plan.getProduct().getCode() : null;
        } catch (Exception ignored) {
            return null;
        }
    }

    private Long resolveModelId(ProductPlan plan) {
        try {
            return plan.getProduct() != null && plan.getProduct().getModel() != null
                    ? plan.getProduct().getModel().getId()
                    : null;
        } catch (Exception ignored) {
            return null;
        }
    }

    private String buildPlanTypeLabel(TypePlan typePlan) {
        if (typePlan == TypePlan.MOLD_TRIAL) {
            return "THỬ KHUÔN";
        }
        if (typePlan == TypePlan.SECOND_PROCESS) {
            return "GIA CÔNG LẦN 2";
        }
        if (typePlan == TypePlan.EVENT) {
            return "SỰ KIỆN";
        }
        return "KHÁC";
    }
}