package htmp.codien.quanlycodien.modules.newmodel.plan.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.common.enums.HtmpStatus;
import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanApproveResultBatchRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanApproveResultDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanApproveResultRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanApproveResult;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanApproveResultRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanRepository;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationEvent;
import htmp.codien.quanlycodien.modules.notification.service.NotificationTriggerEvent;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductPlanApproveResultServiceImpl implements ProductPlanApproveResultService {

    private final ProductPlanApproveResultRepository approveResultRepository;
    private final ProductPlanRepository productPlanRepository;
    private final ApplicationEventPublisher applicationEventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<ProductPlanApproveResultDTO> getApproveResultsByPlanId(Long planId) {

        ProductPlan plan = productPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch thử khuôn với ID: " + planId));

        List<ProductPlanApproveResult> approveResults = approveResultRepository
                .findByPlanIdOrderByCreatedAtDesc(planId);

        return approveResults.stream()
                .filter(result -> isAllowedApproveResultDepartment(plan.getTypePlan(), result.getDepartmentCode()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProductPlanApproveResultDTO updateApproveResult(Long moldTrialPlanId, String departmentCode,
            ProductPlanApproveResultRequest request) {
        Employee currentEmployee = requireCurrentEmployee();

        ProductPlan moldTrialPlan = productPlanRepository.findById(moldTrialPlanId)
                .orElseThrow(
                        () -> new RuntimeException("Không tìm thấy kế hoạch thử khuôn với ID: " + moldTrialPlanId));

        if (!isAllowedApproveResultDepartment(moldTrialPlan.getTypePlan(), departmentCode)) {
            throw new RuntimeException("Phòng ban " + departmentCode + " không hợp lệ cho loại kế hoạch này.");
        }

        Optional<ProductPlanApproveResult> existingResult = approveResultRepository
                .findByPlan_IdAndDepartmentCode(moldTrialPlanId, departmentCode);

        ProductPlanApproveResult approveResult;
        if (existingResult.isPresent()) {
            approveResult = existingResult.get();
            approveResult.setResult(request.getResult());
            approveResult.setComment(request.getComment());
            approveResult.setApprovedBy(currentEmployee);
        } else {
            approveResult = ProductPlanApproveResult.builder()
                    .plan(moldTrialPlan)
                    .departmentCode(departmentCode)
                    .result(request.getResult())
                    .comment(request.getComment())
                    .approvedBy(currentEmployee)
                    .build();
        }

        approveResult = approveResultRepository.save(approveResult);

        if (areAllDepartmentResultsCompleted(moldTrialPlan)) {
            moldTrialPlan.setStatus(HtmpStatus.WAITTINGFARESULT);
            productPlanRepository.save(moldTrialPlan);
        }

        return convertToDTO(approveResult);
    }

    @Override
    public void batchUpdateApproveResults(Long planId,
            ProductPlanApproveResultBatchRequest batchRequest) {
        Employee currentEmployee = requireCurrentEmployee();

        ProductPlan plan = productPlanRepository.findById(planId)
                .orElseThrow(
                        () -> new RuntimeException("Không tìm thấy kế hoạch thử khuôn với ID: " + planId));

        boolean isSuperAdmin = SecurityUtils.hasRole(Role.SUPERADMIN);
        String currentUserDepartmentCode = null;

        if (!isSuperAdmin) {

            if (SecurityUtils.getCurrentDepartment() == null) {
                throw new RuntimeException("Không thể xác định phòng ban của người dùng hiện tại");
            }
            currentUserDepartmentCode = SecurityUtils.getCurrentDepartment().getCode();
        }

        String currentUserDepartmentCodeFinal = currentUserDepartmentCode;

        for (ProductPlanApproveResultRequest request : batchRequest.getApproveResults()) {

            if (!isSuperAdmin && !request.getDepartmentCode().equals(currentUserDepartmentCodeFinal)) {
                throw new RuntimeException(
                        "Bạn không có quyền cập nhật kết quả duyệt cho phòng ban: " + request.getDepartmentCode());
            }

            if (!isAllowedApproveResultDepartment(plan.getTypePlan(), request.getDepartmentCode())) {
                throw new RuntimeException(
                        "Phòng ban " + request.getDepartmentCode() + " không hợp lệ cho loại kế hoạch này.");
            }

            Optional<ProductPlanApproveResult> existingResult = approveResultRepository
                    .findByPlan_IdAndDepartmentCode(planId, request.getDepartmentCode());

            ProductPlanApproveResult approveResult;
            if (existingResult.isPresent()) {
                approveResult = existingResult.get();
                approveResult.setResult(request.getResult());
                approveResult.setComment(request.getComment());
                approveResult.setApprovedBy(currentEmployee);
            } else {
                approveResult = ProductPlanApproveResult.builder()
                        .plan(plan)
                        .departmentCode(request.getDepartmentCode())
                        .result(request.getResult())
                        .comment(request.getComment())
                        .approvedBy(currentEmployee)
                        .build();
            }

            approveResultRepository.save(approveResult);

            sendNotification(NotificationEvent.PRODUCT_PLAN_RESULT_APPROVE, plan);
        }

        if (areAllDepartmentResultsCompleted(plan)) {
            plan.setStatus(HtmpStatus.WAITTINGFARESULT);
            productPlanRepository.save(plan);
        }
    }

    @Override
    public void deleteApproveResult(Long planId, String departmentCode) {

        if (!productPlanRepository.existsById(planId)) {
            throw new RuntimeException("Không tìm thấy kế hoạch thử khuôn với ID: " + planId);
        }

        approveResultRepository.deleteByPlan_IdAndDepartmentCode(planId, departmentCode);
    }

    private ProductPlanApproveResultDTO convertToDTO(ProductPlanApproveResult entity) {
        Employee approvedBy = entity.getApprovedBy();

        return ProductPlanApproveResultDTO.builder()
                .id(entity.getId())
                .planId(entity.getPlan().getId())
                .departmentCode(entity.getDepartmentCode())
                .result(entity.getResult())
                .comment(entity.getComment())
                .approvedByCode(approvedBy != null ? approvedBy.getCode() : null)
                .approvedByName(approvedBy != null ? approvedBy.getName() : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private boolean isAllowedApproveResultDepartment(TypePlan typePlan, String departmentCode) {
        if (departmentCode == null) {
            return false;
        }
        String normalized = departmentCode.trim().toUpperCase();
        if (typePlan == TypePlan.SECOND_PROCESS) {
            return normalized.equals("QC") || normalized.equals("P-NMD") || normalized.equals("SX");
        }
        return normalized.equals("KT") || normalized.equals("MOLD") || normalized.equals("P-NMD")
                || normalized.equals("QC") || normalized.equals("SX");
    }

    private Employee requireCurrentEmployee() {
        Employee currentEmployee = SecurityUtils.getCurrentEmployee();
        if (currentEmployee == null) {
            throw new RuntimeException("Không thể xác định người dùng hiện tại");
        }
        return currentEmployee;
    }

    private boolean areAllDepartmentResultsCompleted(ProductPlan plan) {
        java.util.Set<String> allowedDepartments = getAllowedApproveResultDepartments(plan.getTypePlan());
        if (allowedDepartments.isEmpty()) {
            return false;
        }

        java.util.Set<String> completedDepartments = plan.getApproveResults() == null
                ? java.util.Set.of()
                : plan.getApproveResults().stream()
                        .filter(r -> r.getResult() != null && r.getDepartmentCode() != null)
                        .map(r -> r.getDepartmentCode().trim().toUpperCase())
                        .filter(allowedDepartments::contains)
                        .collect(java.util.stream.Collectors.toSet());

        return completedDepartments.containsAll(allowedDepartments);
    }

    private java.util.Set<String> getAllowedApproveResultDepartments(TypePlan typePlan) {
        if (typePlan == TypePlan.SECOND_PROCESS) {
            return java.util.Set.of("QC", "P-NMD", "SX");
        }
        return java.util.Set.of("KT", "MOLD", "P-NMD", "QC", "SX");
    }

    private void sendNotification(NotificationEvent event, ProductPlan plan) {
        var current = SecurityUtils.getCurrentEmployee();
        applicationEventPublisher.publishEvent(
                new NotificationTriggerEvent(
                        event,
                        Map.of(
                                "planId", plan.getId(),
                                "modelId", plan.getProduct().getModel().getId(),
                                "productId", plan.getProduct().getId(),
                                "planName", plan.getName(),
                                "productCode", plan.getProduct().getCode(),
                                "employeeCode", current != null ? current.getCode() : "SYSTEM",
                                "employeeName", current != null ? current.getName() : "SYSTEM")));
    }

}