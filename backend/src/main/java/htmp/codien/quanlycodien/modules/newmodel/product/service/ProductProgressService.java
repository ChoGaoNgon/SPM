package htmp.codien.quanlycodien.modules.newmodel.product.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;

import htmp.codien.quanlycodien.common.enums.ApprovalStatus;
import htmp.codien.quanlycodien.common.enums.HtmpResult;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanInspection;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanApproval;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanApproveResult;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanIssue;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductProgressResponse;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductProgressResponse.StepDetail;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.entity.ProductEventQcCheck;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductProgressService {
        private final ProductPlanRepository productPlanRepository;

        public List<ProductProgressResponse> getProgressByProductId(Long productId) {

                List<ProductProgressResponse> progressList = new ArrayList<>();

                List<ProductPlan> plans = productPlanRepository.findByProduct_Id(productId);
                for (ProductPlan plan : plans) {
                        List<StepDetail> stepDetails = new ArrayList<>();
                        List<ProductPlanApproval> approvals = plan.getApprovals();
                        boolean hasRejection = false;
                        for (ProductPlanApproval approval : approvals) {
                                stepDetails.add(StepDetail.builder()
                                                .stepName(approval.getApprovalTypeName())
                                                .responsibleBy(approval.getApprovedBy() != null
                                                                ? approval.getApprovedBy().getName()
                                                                : "--")
                                                .result(approval.getStatus() != null
                                                                ? approval.getStatus().getDescription()
                                                                : ApprovalStatus.PENDING.getDescription())
                                                .remark(approval.getRemark() != null ? approval.getRemark() : "--")
                                                .build());

                                if (approval.getStatus() == ApprovalStatus.REJECTED) {
                                        hasRejection = true;
                                        break;
                                }
                        }

                        if (plan.getTypePlan() == TypePlan.MOLD_TRIAL) {
                                List<ProductPlanIssue> issues = plan.getIssues();
                                for (ProductPlanIssue issue : issues) {
                                        stepDetails.add(StepDetail.builder()
                                                        .stepName("Issue: " + issue.getIssueDescription())
                                                        .responsibleBy("Bộ phận khuôn")
                                                        .result(Boolean.TRUE.equals(issue.getImplemented())
                                                                        ? "Đã thực hiện"
                                                                        : "Chưa thực hiện")
                                                        .remark("--")
                                                        .build());
                                }

                                List<ProductPlanApproveResult> approveResults = plan.getApproveResults();
                                if (approveResults != null && !approveResults.isEmpty()) {
                                        for (ProductPlanApproveResult approveResult : approveResults) {
                                                String departmentCode = approveResult.getDepartmentCode() != null
                                                                ? approveResult.getDepartmentCode()
                                                                : "--";
                                                String approvedBy = approveResult.getApprovedBy() != null
                                                                ? approveResult.getApprovedBy().getCode()
                                                                : "--";
                                                String resultByDepartment = approveResult.getResult() != null
                                                                ? approveResult.getResult().name()
                                                                : "--";
                                                stepDetails.add(StepDetail.builder()
                                                                .stepName("Đánh giá kế hoạch thử khuôn - "
                                                                                + mapDepartmentName(departmentCode))
                                                                .responsibleBy(approvedBy)
                                                                .result(resultByDepartment)
                                                                .remark(approveResult.getComment() != null
                                                                                ? approveResult.getComment()
                                                                                : "--")
                                                                .build());
                                        }

                                        stepDetails.add(StepDetail.builder()
                                                        .stepName("Kết quả thử khuôn cuối cùng")
                                                        .responsibleBy("--")
                                                        .result(calculateOverallMoldTrialResult(approveResults))
                                                        .remark("--")
                                                        .build());
                                }

                                ProductPlanInspection faInspection = plan.getInspections();
                                if (faInspection != null) {
                                        String checkedBy = faInspection.getFinalCheckedBy() != null
                                                        ? faInspection.getFinalCheckedBy().getCode() + " - "
                                                                        + faInspection.getFinalCheckedBy().getName()
                                                        : "--";
                                        String result = faInspection.getFinalResult() != null
                                                        ? faInspection.getFinalResult().toString()
                                                        : "--";
                                        if (!hasRejection)
                                                stepDetails.add(StepDetail.builder()
                                                                .stepName("Kết quả FA")
                                                                .responsibleBy(checkedBy != null ? checkedBy : "--")
                                                                .result(result != null ? result : "--")
                                                                .remark("--")
                                                                .build());
                                }
                        }

                        if (plan.getTypePlan() == TypePlan.EVENT) {
                                ProductEventQcCheck qcCheck = plan.getProductEventQcCheck();
                                if (qcCheck != null) {
                                        String codeEmpVisualCheck = qcCheck.getVisualCheckedBy() != null
                                                        ? qcCheck.getVisualCheckedBy().getCode() + " - "
                                                                        + qcCheck.getVisualCheckedBy().getName()
                                                        : "--";
                                        String codeEmpDimensionCheck = qcCheck.getDimensionCheckedBy() != null
                                                        ? qcCheck.getDimensionCheckedBy().getCode() + " - "
                                                                        + qcCheck.getDimensionCheckedBy().getName()
                                                        : "--";

                                        String resultVisual = qcCheck.getVisualResult() != null
                                                        ? qcCheck.getVisualResult().name()
                                                        : "DELAYED";
                                        String resultDimension = qcCheck.getDimensionResult() != null
                                                        ? qcCheck.getDimensionResult().name()
                                                        : "DELAYED";

                                        boolean sameChecker = Objects.equals(codeEmpDimensionCheck, codeEmpVisualCheck);
                                        stepDetails.add(StepDetail.builder()
                                                        .stepName("QC Check")
                                                        .responsibleBy(sameChecker
                                                                        ? codeEmpVisualCheck
                                                                        : "Kích thước: " + codeEmpDimensionCheck
                                                                                        + " | Ngoại quan: "
                                                                                        + codeEmpVisualCheck)
                                                        .result(sameChecker
                                                                        ? resultDimension
                                                                        : "Kích thước: " + resultDimension
                                                                                        + " | Ngoại quan: "
                                                                                        + resultVisual)
                                                        .remark("--")
                                                        .build());
                                } else {
                                        stepDetails.add(StepDetail.builder()
                                                        .stepName("QC Check")
                                                        .responsibleBy("--")
                                                        .result("DELAYED")
                                                        .remark("--")
                                                        .build());
                                }
                        }

                        ProductProgressResponse stage = ProductProgressResponse.builder()
                                        .stageName(plan.getName() != null ? plan.getName() : plan.getTypePlan().name())
                                        .plannedStartDate(plan.getRequestStartTime() != null
                                                        ? plan.getRequestStartTime().toLocalDate()
                                                        : null)
                                        .plannedEndDate(plan.getRequestEndTime() != null
                                                        ? plan.getRequestEndTime().toLocalDate()
                                                        : (plan.getRequestStartTime() != null
                                                                        ? plan.getRequestStartTime().toLocalDate()
                                                                        : null))
                                        .actualStartDate(plan.getActualStartTime() != null
                                                        ? plan.getActualStartTime().toLocalDate()
                                                        : null)
                                        .actualEndDate(plan.getActualEndTime() != null
                                                        ? plan.getActualEndTime().toLocalDate()
                                                        : null)
                                        .url(buildPlanUrl(plan))
                                        .status(plan.getStatus().name())
                                        .steps(stepDetails)
                                        .build();

                        progressList.add(stage);
                }

                return progressList;
        }

        private String buildPlanUrl(ProductPlan plan) {
                if (plan.getProduct() == null || plan.getProduct().getModel() == null) {
                        return null;
                }
                Long modelId = plan.getProduct().getModel().getId();
                Long productId = plan.getProduct().getId();
                return "/product-manager/models/" + modelId + "/products/" + productId + "/plan/" + plan.getId();
        }

        private String calculateOverallMoldTrialResult(List<ProductPlanApproveResult> approveResults) {
                if (approveResults == null || approveResults.isEmpty()) {
                        return "--";
                }

                boolean allOk = approveResults.stream()
                                .allMatch(result -> HtmpResult.OK.equals(result.getResult()));

                return allOk ? HtmpResult.OK.name() : HtmpResult.NG.name();
        }

        private String mapDepartmentName(String departmentCode) {
                if (departmentCode == null || departmentCode.isBlank()) {
                        return "--";
                }

                return switch (departmentCode.toUpperCase()) {
                        case "KT" -> "KT";
                        case "MOLD" -> "Khuôn";
                        case "P-NMD", "NMD" -> "P-NMD";
                        case "QC" -> "QC";
                        case "SX" -> "SX";
                        default -> departmentCode;
                };
        }
}
