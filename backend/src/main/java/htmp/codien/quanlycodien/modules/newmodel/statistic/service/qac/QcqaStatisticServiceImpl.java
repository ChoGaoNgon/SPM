package htmp.codien.quanlycodien.modules.newmodel.statistic.service.qac;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productFaInspection.ProductInspectionDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PendingSampleReceiptDto;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PlanSummaryDto;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.QcqaApprovalPendingDto;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanInspection;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductFaInspectionRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.specification.ProductInspectionSpecification;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QcqaStatisticServiceImpl implements QcqaStatisticService {

        private final ProductFaInspectionRepository productFaInspectionRepository;
        private final ProductPlanRepository productPlanRepository;

        @Override
        @Transactional(readOnly = true)
        public List<QcqaApprovalPendingDto> getPlanInspectionApprovalPending(String param) {
                return productFaInspectionRepository.findAll(
                                ProductInspectionSpecification.pendingQcInputWithKeyword(param),
                                Sort.by(Sort.Order.asc("inspectionDeadline"), Sort.Order.asc("receivedDate"),
                                                Sort.Order.desc("id")))
                                .stream()
                                .map(this::toPendingDto)
                                .toList();
        }

        private QcqaApprovalPendingDto toPendingDto(ProductPlanInspection inspection) {
                var plan = inspection.getPlan();
                var product = plan != null ? plan.getProduct() : null;
                var model = product != null ? product.getModel() : null;

                PlanSummaryDto planSummary = PlanSummaryDto.builder()
                                .id(plan != null ? plan.getId() : null)
                                .modelId(model != null ? model.getId() : null)
                                .productId(product != null ? product.getId() : null)
                                .name(plan != null ? plan.getName() : null)
                                .typePlanDescription(
                                                plan != null && plan.getTypePlan() != null ? plan.getTypePlan().name()
                                                                : null)
                                .productCode(product != null ? product.getCode() : null)
                                .modelCode(model != null ? model.getCode() : null)
                                .createdBy(plan != null ? plan.getCreatedBy() : null)
                                .status(plan != null && plan.getStatus() != null ? plan.getStatus().name() : null)
                                .statusDescription(plan != null && plan.getStatus() != null
                                                ? plan.getStatus().getDescription()
                                                : null)
                                .statusColor(plan != null && plan.getStatus() != null ? plan.getStatus().getColor()
                                                : null)
                                .build();

                ProductInspectionDTO inspectionDto = ProductInspectionDTO.builder()
                                .machineCode(inspection.getMachineCode())
                                .inspectionDate(inspection.getInspectionDateActual())
                                .inspectionDeadline(inspection.getInspectionDeadline())
                                .inspectedQuantity(inspection.getInspectedQuantity())
                                .ngQuantity(inspection.getNgQuantity())
                                .receivedDate(inspection.getReceivedDate())
                                .delayReason(inspection.getDelayReason())
                                .visualResult(inspection.getVisualResult())
                                .visualCheckedById(
                                                inspection.getVisualCheckedBy() != null
                                                                ? inspection.getVisualCheckedBy().getId()
                                                                : null)
                                .dimensionResult(inspection.getDimensionResult())
                                .dimensionCheckedById(
                                                inspection.getDimensionCheckedBy() != null
                                                                ? inspection.getDimensionCheckedBy().getId()
                                                                : null)
                                .receivedByEmployeeId(
                                                inspection.getReceivedByEmployee() != null
                                                                ? inspection.getReceivedByEmployee().getId()
                                                                : null)
                                .finalResult(inspection.getFinalResult())
                                .finalCheckedById(
                                                inspection.getFinalCheckedBy() != null
                                                                ? inspection.getFinalCheckedBy().getId()
                                                                : null)
                                .factoryResult(inspection.getFactoryResult())
                                .factoryCheckedById(
                                                inspection.getFactoryCheckedBy() != null
                                                                ? inspection.getFactoryCheckedBy().getId()
                                                                : null)
                                .qcNote(inspection.getQcNote())
                                .build();

                return QcqaApprovalPendingDto.builder()
                                .planSummary(planSummary)
                                .productInspection(inspectionDto)
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public List<PendingSampleReceiptDto> getPendingSampleReceipts() {
                return productPlanRepository.findPendingSampleReceipts();
        }

}
