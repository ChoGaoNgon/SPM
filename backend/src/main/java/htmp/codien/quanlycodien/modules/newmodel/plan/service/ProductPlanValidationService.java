package htmp.codien.quanlycodien.modules.newmodel.plan.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import htmp.codien.quanlycodien.common.enums.HtmpStatus;
import htmp.codien.quanlycodien.common.exception.ConflictException;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanApproval;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanApprovalRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanLimitConfigRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanRepository;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductPlanScopeType;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.MachinePlanConflictProjection;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductPlanValidationService {

        private final ProductPlanRepository productPlanRepository;
        private final ProductPlanLimitConfigRepository productPlanLimitConfigRepository;
        private final ProductPlanApprovalRepository approvalRepository;

        public void validateDailyPlannedLimit(TypePlan typePlan, Employee creator) {
                if (typePlan != TypePlan.MOLD_TRIAL) {
                        return;
                }

                if (creator.getDepartment() == null || creator.getDepartment().getId() == null) {
                        throw new ConflictException("Không xác định được bộ phận của người lập kế hoạch.");
                }

                Long departmentId = creator.getDepartment().getId();
                LocalDateTime from = LocalDateTime.now().toLocalDate().atStartOfDay();
                LocalDateTime to = from.plusDays(1);

                int companyLimit = productPlanLimitConfigRepository.findMaxPlanByScopeType(
                                ProductPlanScopeType.COMPANY, TypePlan.MOLD_TRIAL);
                int departmentLimitByCreator = productPlanLimitConfigRepository.findMaxPlanByScopeTypeAndEmployee(
                                creator.getId(), TypePlan.MOLD_TRIAL.name());

                long companyCurrentPlanned = productPlanRepository
                                .countByTypePlanAndCreatedAtGreaterThanEqualAndCreatedAtLessThanAndStatusNot(
                                                typePlan,
                                                from,
                                                to,
                                                HtmpStatus.CANCELLED);

                if (companyCurrentPlanned >= companyLimit) {
                        throw new ConflictException(
                                        "Đã đạt giới hạn toàn công ty. Vui lòng liên hệ với phòng PC để được hỗ trợ.");
                }

                long departmentCurrentPlanned = productPlanRepository.countPlannedByCreatorDepartment(
                                departmentId,
                                typePlan,
                                from,
                                to,
                                HtmpStatus.CANCELLED);

                if (departmentCurrentPlanned >= departmentLimitByCreator) {
                        throw new ConflictException(
                                        "Bộ phận của bạn đã đạt giới hạn lập kế hoạch thử khuôn. Vui lòng liên hệ với phòng PC để được hỗ trợ.");
                }
        }

        public void validateMachineTimeConflict(Long machineId, LocalDateTime requestStartTime,
                        LocalDateTime requestEndTime,
                        Long excludedPlanId) {
                if (machineId == null || requestStartTime == null || requestEndTime == null) {
                        return;
                }

                if (!requestEndTime.isAfter(requestStartTime)) {
                        throw new ConflictException(
                                        "Khung giờ kế hoạch không hợp lệ: thời gian kết thúc phải sau thời gian bắt đầu.");
                }

                List<MachinePlanConflictProjection> conflictingPlans = productPlanRepository
                                .findOverlappingPlansByMachineId(
                                                machineId,
                                                requestStartTime,
                                                requestEndTime,
                                                HtmpStatus.CANCELLED,
                                                excludedPlanId);

                if (!conflictingPlans.isEmpty()) {
                        MachinePlanConflictProjection conflict = conflictingPlans.get(0);
                        String conflictTimeRange = buildTimeRangeDisplay(
                                        conflict.getConflictStartTime(),
                                        conflict.getConflictEndTime());

                        throw new ConflictException(
                                        "Không thể sắp xếp kế hoạch vì máy đã được sử dụng trong cùng khung giờ.\n"
                                                        + "Kế hoạch trùng: "
                                                        + (conflict.getPlanName() != null ? conflict.getPlanName()
                                                                        : "N/A")
                                                        + "\n"
                                                        + "Sản phẩm: "
                                                        + (conflict.getProductCode() != null ? conflict.getProductCode()
                                                                        : "N/A")
                                                        + (conflict.getProductName() != null
                                                                        ? " - " + conflict.getProductName()
                                                                        : "")
                                                        + "\nThời gian: " + conflictTimeRange
                                                        + "\nVui lòng chọn máy khác hoặc điều chỉnh lại thời gian.");
                }
        }

        public void validateAllApprovalsCompleted(Long planId) {
                List<ProductPlanApproval> approvals = approvalRepository.findByPlan_IdOrderByApprovalOrderAsc(planId);

                if (approvals.isEmpty()) {
                        return;
                }

                boolean allApproved = approvals.stream()
                                .allMatch(a -> a.getStatus() == htmp.codien.quanlycodien.common.enums.ApprovalStatus.APPROVED);

                if (!allApproved) {
                        boolean hasRejected = approvals.stream()
                                        .anyMatch(a -> a.getStatus() == htmp.codien.quanlycodien.common.enums.ApprovalStatus.REJECTED);

                        if (hasRejected) {
                                throw new ConflictException(
                                                "Không thể cập nhật. Kế hoạch đã bị từ chối trong quá trình phê duyệt.");
                        }

                        ProductPlanApproval pendingApproval = approvals.stream()
                                        .filter(a -> a.getStatus() == htmp.codien.quanlycodien.common.enums.ApprovalStatus.PENDING)
                                        .findFirst()
                                        .orElse(null);

                        String pendingStep = pendingApproval != null ? pendingApproval.getApprovalTypeName() : "";

                        throw new ConflictException(
                                        "Không thể cập nhật. Vui lòng hoàn thành tất cả các bước phê duyệt trước khi cập nhật thông tin. "
                                                        + "Bước đang chờ: " + pendingStep);
                }
        }

        public boolean isUnusualPlan(LocalDateTime requestStartTime) {
                return requestStartTime != null && LocalDateTime.now().isAfter(requestStartTime);
        }

        private String buildTimeRangeDisplay(LocalDateTime startTime, LocalDateTime endTime) {
                String startDisplay = startTime != null ? startTime.toString() : "N/A";
                String endDisplay = endTime != null ? endTime.toString() : "N/A";
                return startDisplay + " -> " + endDisplay;
        }
}
