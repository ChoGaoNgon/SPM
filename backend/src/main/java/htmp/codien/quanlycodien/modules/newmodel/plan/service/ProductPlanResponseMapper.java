package htmp.codien.quanlycodien.modules.newmodel.plan.service;

import htmp.codien.quanlycodien.common.enums.HtmpResult;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.ProductPlanApprovalDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PlanResponse;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanResinResponse;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.*;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanDelayLogRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.service.materialCategory.MaterialCategoryService;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductResinMappingDTO;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.PlanDelayType;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductPlanResponseMapper {

    private final ProductPlanDelayLogRepository productPlanDelayLogRepository;
    @Autowired(required = false)
    private MaterialCategoryService materialCategoryService;

    public void populatePlanResponseDetails(ProductPlan plan, PlanResponse response) {
        if (plan == null || response == null) {
            return;
        }

        response.setIsUnusual(Boolean.TRUE.equals(plan.getIsUnusual()));
        response.setCreatedBy(plan.getCreatedBy());
        response.setCreatedByCode(plan.getCreatedBy());
        response.setRequestTimeNote(plan.getRequestTimeNote());
        response.setRequestMachineNote(plan.getRequestMachineNote());
        response.setRequestStartTimeNote(plan.getLegacyRequestStartTimeNote());
        response.setRequestEndTimeNote(plan.getLegacyRequestEndTimeNote());
        response.setPreviousRequestStartTime(null);
        response.setPreviousRequestEndTime(null);

        if (plan.getProduct() != null) {
            response.setProductCode(plan.getProduct().getCode());
        }

        if (plan.getResponsibleEmployee() != null) {
            response.setResponsibleEmployeeId(plan.getResponsibleEmployee().getId());
            response.setResponsibleEmployeeName(plan.getResponsibleEmployee().getName());
            response.setResponsibleEmployeeCode(plan.getResponsibleEmployee().getCode());
        }

        if (plan.getProductSampleSubmitter() != null) {
            response.setProductSampleSubmitterId(plan.getProductSampleSubmitter().getId());
            response.setProductSampleSubmitterCode(plan.getProductSampleSubmitter().getCode());
            response.setProductSampleSubmitterName(plan.getProductSampleSubmitter().getName());
        }

        ProductPlanDelayLog delayLog = productPlanDelayLogRepository.findTopByStatusNative(plan.getId(),
                "PLAN_END_TIME_DELAY");
        if (delayLog != null) {
            response.setPlanDelayReason(delayLog.getReason());
        }
        ProductPlanDelayLog faSubmitDelayLog = productPlanDelayLogRepository.findTopByStatusNative(plan.getId(),
                PlanDelayType.FA_SUBMIT_DELAY.toString());
        if (faSubmitDelayLog != null) {
            response.setFaSubmitDelayReason(faSubmitDelayLog.getReason());
        }

        if (plan.getMachine() != null) {
            response.setMachineId(plan.getMachine().getId());
            response.setMachineCode(plan.getMachine().getCode());
            response.setMachineNo(plan.getMachine().getMachineNo());
            if (response.getMachineCapacityTon() == null) {
                response.setMachineCapacityTon(plan.getMachine().getCapacityTon());
            }
        }

        boolean shouldSetMoldCode = plan.getTypePlan() != TypePlan.SECOND_PROCESS;
        if (shouldSetMoldCode && plan.getProduct() != null && plan.getProduct().getMold() != null) {
            response.setMoldCode(plan.getProduct().getMold().getCode());
        }

        response.setOverallApproveResult(calculateOverallResult(plan.getApproveResults()));

        if (plan.getApprovals() != null && !plan.getApprovals().isEmpty()) {
            response.setApprovals(plan.getApprovals().stream()
                    .map(this::mapApprovalToDTO)
                    .collect(Collectors.toList()));
        }

        if (plan.getProductPlanResins() != null && !plan.getProductPlanResins().isEmpty()) {
            response.setPlastics(plan.getProductPlanResins().stream()
                    .map(this::mapPlasticToDTO)
                    .collect(Collectors.toList()));
        }

    }

    private HtmpResult calculateOverallResult(List<ProductPlanApproveResult> approveResults) {
        if (approveResults == null || approveResults.isEmpty()) {
            return null;
        }

        boolean allOk = approveResults.stream()
                .allMatch(result -> HtmpResult.OK.equals(result.getResult()));
        return allOk ? HtmpResult.OK : HtmpResult.NG;
    }

    private ProductPlanApprovalDTO mapApprovalToDTO(ProductPlanApproval approval) {
        ProductPlanApprovalDTO dto = ProductPlanApprovalDTO.builder()
                .id(approval.getId())
                .approvalType(approval.getApprovalType())
                .approvalTypeName(approval.getApprovalTypeName())
                .approvalOrder(approval.getApprovalOrder())
                .status(approval.getStatus())
                .remark(approval.getRemark())
                .approvedAt(approval.getApprovedAt())
                .requiredPermission(approval.getRequiredPermission())
                .createdAt(approval.getCreatedAt())
                .updatedAt(approval.getUpdatedAt())
                .createdBy(approval.getCreatedBy())
                .updatedBy(approval.getUpdatedBy())
                .build();

        if (approval.getApprovedBy() != null) {
            dto.setApprovedById(approval.getApprovedBy().getId());
            dto.setApprovedByName(approval.getApprovedBy().getName());
            dto.setApprovedByCode(approval.getApprovedBy().getCode());
        }

        return dto;
    }

    private ProductPlanResinResponse mapPlasticToDTO(ProductPlanResinMapping plastic) {
        ProductResinMappingDTO.ProductResinMappingDTOBuilder resinDtoBuilder = ProductResinMappingDTO.builder()
                .code(plastic.getResinCode());

        if (materialCategoryService != null && plastic.getResinCode() != null) {
            List<ProductResinMappingDTO> details = materialCategoryService.getResin(plastic.getResinCode());
            if (!details.isEmpty()) {
                ProductResinMappingDTO detail = details.get(0);
                resinDtoBuilder
                        .type(detail.getType())
                        .colorName(detail.getColorName())
                        .grade(detail.getGrade())
                        .description(detail.getDescription());
            }
        }

        return ProductPlanResinResponse.builder()
                .id(plastic.getId())
                .resin(resinDtoBuilder.build())
                .isRecycle(plastic.getIsRecycle())
                .plasticExpectedWeight(plastic.getPlasticExpectedWeight())
                .plasticActualWeight(plastic.getPlasticActualWeight())
                .build();
    }


}
