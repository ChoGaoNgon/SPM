package htmp.codien.quanlycodien.modules.newmodel.plan.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import htmp.codien.quanlycodien.common.enums.ApprovalStatus;
import htmp.codien.quanlycodien.common.enums.HtmpStatus;
import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanApproval;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanApprovalTemplate;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanApprovalRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanApprovalTemplateRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanRepository;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductPlanApprovalManager {

    private final ProductPlanApprovalTemplateRepository approvalTemplateRepository;
    private final ProductPlanApprovalRepository approvalRepository;
    private final ProductPlanRepository productPlanRepository;

    public void generateApprovalsFromTemplate(ProductPlan plan) {
        generateApprovalsFromTemplate(plan, null);
    }

    public void generateApprovalsFromTemplate(ProductPlan plan, Employee creator) {
        List<ProductPlanApprovalTemplate> templates = approvalTemplateRepository.findAllByOrderByApprovalOrderAsc();
        if (templates.isEmpty()) {
            return;
        }

        if (plan.getApprovals() == null) {
            plan.setApprovals(new ArrayList<>());
        }

        plan.getApprovals().clear();

        for (ProductPlanApprovalTemplate template : templates) {
            if (!Boolean.TRUE.equals(plan.getRequestResinFromPC())
                    && "APPROVE_RESIN".equalsIgnoreCase(template.getApprovalType())) {
                continue;
            }

            if (TypePlan.SECOND_PROCESS == plan.getTypePlan() && isTechnicalApproval(template)) {
                continue;
            }

            if (TypePlan.SECOND_PROCESS != plan.getTypePlan() && isProductionApproval(template)) {
                continue;
            }

            ProductPlanApproval approval = new ProductPlanApproval();
            approval.setPlan(plan);
            approval.setApprovalType(template.getApprovalType());
            approval.setApprovalTypeName(template.getApprovalTypeName());
            approval.setApprovalOrder(template.getApprovalOrder());
            approval.setStatus(ApprovalStatus.PENDING);
            approval.setRequiredPermission(template.getRequiredPermission());
            plan.getApprovals().add(approval);
        }

        if (creator != null) {
            autoApproveByCreatorRole(plan, creator);
        }

        if (!plan.getApprovals().isEmpty()) {
            updatePlanStatusToWaitingForFirstApproval(plan);
        }
    }

    private void autoApproveByCreatorRole(ProductPlan plan, Employee creator) {
        if (creator == null || creator.getRole() == null) {
            return;
        }

        Role role = creator.getRole();
        boolean isManager = role == Role.MANAGER;
        boolean isHeadOrAbove = role == Role.HEAD || role == Role.DIRECTOR || role == Role.SUPERADMIN;

        if (!isManager && !isHeadOrAbove) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        for (ProductPlanApproval approval : plan.getApprovals()) {
            String type = approval.getApprovalType();
            if (type == null)
                continue;

            String normalized = type.trim().toUpperCase();
            boolean isChecker = "APPROVE_CHECKER".equals(normalized) || "CHECKER".equals(normalized);
            boolean isHeadNmd = "APPROVE_HEAD_NMD".equals(normalized) || "HEAD_NMD".equals(normalized);

            if (isChecker || (isHeadOrAbove && isHeadNmd)) {
                approval.setStatus(ApprovalStatus.APPROVED);
                approval.setApprovedBy(creator);
                approval.setApprovedAt(now);
                approval.setRemark("Tự động phê duyệt - người tạo là " + role.getDescription());
            }
        }
    }

    public void updatePlanStatusBasedOnApprovals(ProductPlan plan) {
        List<ProductPlanApproval> allApprovals = approvalRepository
                .findByPlan_IdOrderByApprovalOrderAsc(plan.getId());

        if (allApprovals.isEmpty()) {
            return;
        }

        boolean hasRejected = allApprovals.stream()
                .anyMatch(a -> a.getStatus() == ApprovalStatus.REJECTED);

        if (hasRejected) {
            plan.setStatus(HtmpStatus.CANCELLED);
            productPlanRepository.save(plan);
            return;
        }

        boolean allApproved = allApprovals.stream()
                .allMatch(a -> a.getStatus() == ApprovalStatus.APPROVED);

        if (allApproved) {
            plan.setStatus(HtmpStatus.PLANNED);
            productPlanRepository.save(plan);
            return;
        }

        ProductPlanApproval nextPendingApproval = allApprovals.stream()
                .filter(a -> a.getStatus() == ApprovalStatus.PENDING)
                .findFirst()
                .orElse(null);

        if (nextPendingApproval != null) {
            setWaitingStatusByRequiredPermission(plan, nextPendingApproval.getRequiredPermission());
            productPlanRepository.save(plan);
        }
    }

    private void updatePlanStatusToWaitingForFirstApproval(ProductPlan plan) {
        if (plan.getApprovals() == null || plan.getApprovals().isEmpty()) {
            return;
        }

        ProductPlanApproval firstApproval = plan.getApprovals().stream()
                .min((a1, a2) -> Integer.compare(a1.getApprovalOrder(), a2.getApprovalOrder()))
                .orElse(null);

        if (firstApproval != null) {
            setWaitingStatusByRequiredPermission(plan, firstApproval.getRequiredPermission());
        }
    }

    private boolean isTechnicalApproval(ProductPlanApprovalTemplate template) {
        if (template.getApprovalType() == null) {
            return false;
        }

        String approvalType = template.getApprovalType().trim().toUpperCase();
        return "TECHNICAL".equals(approvalType) || "APPROVE_TECHNICAL".equals(approvalType);
    }

    private boolean isProductionApproval(ProductPlanApprovalTemplate template) {
        if (template.getApprovalType() == null) {
            return false;
        }

        String approvalType = template.getApprovalType().trim().toUpperCase();
        return "PRODUCTION".equals(approvalType) || "APPROVE_PRODUCTION".equals(approvalType);
    }

    private void setWaitingStatusByRequiredPermission(ProductPlan plan, String approvalKey) {
        if (approvalKey == null) {
            plan.setStatus(HtmpStatus.WAITTINGAPPROVALPLAN);
            return;
        }

        String normalizedApprovalKey = approvalKey.trim().toUpperCase();

        switch (normalizedApprovalKey) {
            case "NMD_PRODUCT_PLAN_APPROVE_CHECKER":
            case "APPROVE_CHECKER":
            case "WAITTINGAPPROVALCHEKER":
                plan.setStatus(HtmpStatus.WAITTINGAPPROVALCHEKER);
                return;
            case "NMD_PRODUCT_PLAN_APPROVE_HEAD_NMD":
            case "APPROVE_HEAD_NMD":
            case "WAITTINGAPPROVALHEADNMD":
                plan.setStatus(HtmpStatus.WAITTINGAPPROVALHEADNMD);
                return;
            case "NMD_PRODUCT_PLAN_APPROVE_RESIN":
            case "APPROVE_RESIN":
            case "WAITTINGAPPROVALRESIN":
                plan.setStatus(HtmpStatus.WAITTINGAPPROVALRESIN);
                return;
            case "NMD_PRODUCT_PLAN_APPROVE_PC":
            case "APPROVE_PLAN":
            case "WAITTINGAPPROVALPLAN":
                plan.setStatus(HtmpStatus.WAITTINGAPPROVALPLAN);
                return;
            case "NMD_PRODUCT_PLAN_APPROVE_PRODUCTION":
            case "APPROVE_PRODUCTION":
            case "WAITTINGAPPROVALPRODUCTION":
                plan.setStatus(HtmpStatus.WAITTINGAPPROVALPRODUCTION);
                return;
            case "NMD_PRODUCT_PLAN_APPROVE_TECHNICAL":
            case "APPROVE_TECHNICAL":
            case "WAITTINGAPPROVALTECHNICAL":
                plan.setStatus(HtmpStatus.WAITTINGAPPROVALTECHNICAL);
                return;
            default:
                plan.setStatus(HtmpStatus.PLANNED);
        }
    }
}
