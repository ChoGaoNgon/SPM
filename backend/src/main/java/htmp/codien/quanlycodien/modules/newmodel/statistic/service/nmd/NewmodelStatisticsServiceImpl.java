package htmp.codien.quanlycodien.modules.newmodel.statistic.service.nmd;

import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;

import htmp.codien.quanlycodien.common.enums.HtmpStatus;
import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.modules.customer.repository.CustomerRepository;
import htmp.codien.quanlycodien.modules.department.repository.DepartmentRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PlanSummaryDto;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductDTO;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductRepository;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.repository.EventStatisticsRepository;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;
import htmp.codien.quanlycodien.modules.newmodel.statistic.dto.NMDCustomerStatDto;
import htmp.codien.quanlycodien.modules.newmodel.statistic.dto.NMDCustomerStatisticalResponse;
import htmp.codien.quanlycodien.modules.newmodel.statistic.dto.NMDEventCompanyStatisticsResponse;
import htmp.codien.quanlycodien.modules.newmodel.statistic.dto.NMDEventNoStatisticsDto;
import htmp.codien.quanlycodien.modules.newmodel.statistic.dto.NMDEventPlanProductDetailDto;
import htmp.codien.quanlycodien.modules.newmodel.statistic.dto.NMDEventStatusStatisticsDto;
import htmp.codien.quanlycodien.modules.newmodel.statistic.dto.NewmodelOverviewStatisticsDetailResponse;
import htmp.codien.quanlycodien.modules.newmodel.statistic.dto.NewmodelOverviewStatisticsPieChartResponse;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.CustomerProductStatusStatisticsProjection;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.EventStatusPlanProductProjection;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.ProductPlanProjection;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.ProductProjection;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NewmodelStatisticsServiceImpl implements NewmodelStatisticsService {

        private final ProductRepository productRepository;
        private final ProductPlanRepository productPlanRepository;
        private final EventStatisticsRepository eventStatisticsRepository;
        private final DepartmentRepository departmentRepository;
        private final CustomerRepository customerRepository;

        @Override
        public NewmodelOverviewStatisticsPieChartResponse getOverviewPieChartStatistics() {
                Long totalProducts = productRepository.count();
                Long moldTrialProductCount = productRepository.countByIsMoldTrialTrue();
                Long eventProductCount = productRepository.countByIsEventTrue();
                Long secondProcessProductCount = productRepository.countByIsSecondProcessTrue();

                return NewmodelOverviewStatisticsPieChartResponse.builder()
                                .totalProducts(totalProducts)
                                .moldTrialProductCount(moldTrialProductCount)
                                .eventProductCount(eventProductCount)
                                .secondProcessProductCount(secondProcessProductCount)
                                .build();
        }

        @Override
        public NewmodelOverviewStatisticsDetailResponse getProductsByPlanType(TypePlan planType) {
                List<ProductProjection> projections = productRepository.findProductsByPlanType(planType.name());

                List<ProductDTO> products = projections.stream()
                                .map(projection -> ProductDTO.builder()
                                                .id(projection.getId())
                                                .code(projection.getCode())
                                                .name(projection.getName())
                                                .modelCode(projection.getModelCode())
                                                .modelId(projection.getModelId())
                                                .moldCode(projection.getMoldCode())
                                                .gateType(projection.getGateType())
                                                .image(projection.getImage())
                                                .nmdInfoStatus(projection.getNmdInfoStatus())
                                                .build())
                                .collect(Collectors.toList());

                return NewmodelOverviewStatisticsDetailResponse.builder()
                                .typePlan(planType)
                                .products(products)
                                .build();
        }

        @Override
        public NMDEventCompanyStatisticsResponse getEventStatisticsByStatus(TypePlan typePlan) {

                Integer maxEventNo = eventStatisticsRepository.findMaxEventNoAllByTypePlan(typePlan.name());
                if (maxEventNo == null || maxEventNo <= 0) {
                        return NMDEventCompanyStatisticsResponse.builder()
                                        .maxEventNo(0)
                                        .totalEvents(0)
                                        .events(List.of())
                                        .build();
                }

                List<EventStatusPlanProductProjection> rawStatistics = eventStatisticsRepository
                                .getEventStatusPlanProductStatistics(typePlan.name());

                Map<Integer, List<EventStatusPlanProductProjection>> statisticsByEventNo = rawStatistics.stream()
                                .collect(Collectors.groupingBy(EventStatusPlanProductProjection::getEventNo));

                List<NMDEventNoStatisticsDto> events = java.util.stream.IntStream.rangeClosed(1, maxEventNo)
                                .mapToObj(eventNo -> {
                                        List<EventStatusPlanProductProjection> eventRows = statisticsByEventNo
                                                        .getOrDefault(eventNo, List.of());
                                        Map<HtmpStatus, List<EventStatusPlanProductProjection>> rowsByStatus = eventRows
                                                        .stream()
                                                        .filter(row -> row.getStatus() != null)
                                                        .collect(Collectors.groupingBy(
                                                                        row -> HtmpStatus.valueOf(row.getStatus())));

                                        List<NMDEventStatusStatisticsDto> statusStatistics = List
                                                        .of(HtmpStatus.values())
                                                        .stream()
                                                        .map(status -> {
                                                                List<NMDEventPlanProductDetailDto> details = rowsByStatus
                                                                                .getOrDefault(status, List.of())
                                                                                .stream()
                                                                                .map(row -> NMDEventPlanProductDetailDto
                                                                                                .builder()
                                                                                                .planId(row.getPlanId())
                                                                                                .planCode(row.getPlanCode())
                                                                                                .productId(row.getProductId())
                                                                                                .productCode(row.getProductCode())
                                                                                                .productName(row.getProductName())
                                                                                                .modelId(row.getModelId())
                                                                                                .modelCode(row.getModelCode())
                                                                                                .customerId(row.getCustomerId())
                                                                                                .customerName(row
                                                                                                                .getCustomerName())
                                                                                                .build())
                                                                                .toList();

                                                                int totalPlans = (int) details.stream()
                                                                                .map(NMDEventPlanProductDetailDto::getPlanId)
                                                                                .distinct()
                                                                                .count();

                                                                return NMDEventStatusStatisticsDto.builder()
                                                                                .status(status)
                                                                                .statusDescription(
                                                                                                status.getDescription())
                                                                                .statusColor(status.getColor())
                                                                                .totalPlans(totalPlans)
                                                                                .totalProducts(details.size())
                                                                                .details(details)
                                                                                .build();
                                                        })
                                                        .toList();

                                        return NMDEventNoStatisticsDto.builder()
                                                        .eventNo(eventNo)
                                                        .statuses(statusStatistics)
                                                        .build();
                                })
                                .toList();

                return NMDEventCompanyStatisticsResponse.builder()
                                .maxEventNo(maxEventNo)
                                .totalEvents(events.size())
                                .events(events)
                                .build();
        }

        @Override
        public List<ProductDTO> getProductsPendingApproval() {

                String currentDepartment = SecurityUtils.getCurrentDepartmentCode();

                List<ProductProjection> projections;

                List<String> saleDepartment = Arrays.asList("KD", "SALE", "BUSINESS");

                if (currentDepartment != null && currentDepartment.contains("NMD")) {
                        projections = productRepository.findProductsPendingNmdApproval();
                } else if (currentDepartment != null && saleDepartment.stream().anyMatch(currentDepartment::contains)) {
                        projections = productRepository.findProductsPendingBusinessApproval();
                } else {

                        return List.of();
                }

                return projections.stream()
                                .map(projection -> ProductDTO.builder()
                                                .id(projection.getId())
                                                .code(projection.getCode())
                                                .name(projection.getName())
                                                .modelCode(projection.getModelCode())
                                                .modelId(projection.getModelId())
                                                .moldCode(projection.getMoldCode())
                                                .gateType(projection.getGateType())
                                                .image(projection.getImage())
                                                .nmdInfoStatus(projection.getNmdInfoStatus())
                                                .infoReceivedDate(projection.getInfoReceivedDate())
                                                .createdAt(projection.getCreatedAt())
                                                .build())
                                .collect(Collectors.toList());
        }

        @Override
        public List<PlanSummaryDto> getPlansPendingApproval() {

                String currentDepartmentCode = SecurityUtils.getCurrentDepartmentCode();
                String currentParentDepartment = null;
                if (currentDepartmentCode != null) {
                        var parentDepartment = departmentRepository.findParentByDepartmentCode(currentDepartmentCode);
                        currentParentDepartment = parentDepartment != null
                                        ? parentDepartment.getCode()
                                        : currentDepartmentCode;
                }

                List<ProductPlanProjection> projections = List.of();
                if (currentParentDepartment != null && currentParentDepartment.contains("PC")) {
                        projections = Stream.concat(
                                        productPlanRepository
                                                        .findProductPlansByStatus(
                                                                        HtmpStatus.WAITTINGAPPROVALRESIN.toString())
                                                        .stream(),
                                        productPlanRepository
                                                        .findProductPlansByStatus(
                                                                        HtmpStatus.WAITTINGAPPROVALPLAN.toString())
                                                        .stream())
                                        .collect(Collectors.collectingAndThen(
                                                        Collectors.toMap(
                                                                        ProductPlanProjection::getPlanId,
                                                                        p -> p,
                                                                        (first, second) -> first,
                                                                        LinkedHashMap::new),
                                                        map -> List.copyOf(map.values())));
                }

                if (currentParentDepartment != null && (currentParentDepartment.contains("NMD")
                                || currentParentDepartment.contains("BGD"))) {
                        projections = Stream.concat(
                                        productPlanRepository
                                                        .findProductPlansByStatus(
                                                                        HtmpStatus.WAITTINGAPPROVALCHEKER.toString())
                                                        .stream(),
                                        productPlanRepository
                                                        .findProductPlansByStatus(
                                                                        HtmpStatus.WAITTINGAPPROVALHEADNMD.toString())
                                                        .stream())
                                        .collect(Collectors.collectingAndThen(
                                                        Collectors.toMap(
                                                                        ProductPlanProjection::getPlanId,
                                                                        p -> p,
                                                                        (first, second) -> first,
                                                                        LinkedHashMap::new),
                                                        map -> List.copyOf(map.values())));
                }

                return projections.stream()
                                .map(projection -> PlanSummaryDto.builder()
                                                .id(projection.getPlanId())
                                                .modelId(projection.getModelId())
                                                .productId(projection.getProductId())
                                                .name(projection.getPlanName())
                                                .typePlanDescription(projection.getPlanType() == null
                                                                ? null
                                                                : projection.getPlanType().name())
                                                .productCode(projection.getProductCode())
                                                .modelCode(projection.getModelCode())
                                                .createdBy(projection.getCreatedBy())
                                                .status(projection.getPlanStatus() == null ? null
                                                                : HtmpStatus.valueOf(projection.getPlanStatus())
                                                                                .getDescription())
                                                .build())
                                .toList();
        }

        @Override
        public NMDCustomerStatisticalResponse getCustomerPlanStatistics(Integer limit) {
                List<CustomerProductStatusStatisticsProjection> projections = customerRepository
                                .getCustomerStatistics(limit != null && limit > 0 ? limit : Integer.MAX_VALUE);

                List<NMDCustomerStatDto> customerStats = projections.stream()
                                .filter(projection -> projection.getCustomerName() != null)
                                .map(projection -> NMDCustomerStatDto.builder()
                                                .customerName(projection.getCustomerName())
                                                .injectionCount(projection.getInjectionCount())
                                                .secondProcessCount(projection.getSecondProcessCount())
                                                .finishedCount(projection.getFinishedCount())
                                                .totalProducts(projection.getTotalProducts())
                                                .build())
                                .sorted(Comparator.comparing(NMDCustomerStatDto::getTotalProducts).reversed())
                                .limit(limit != null && limit > 0 ? limit : Long.MAX_VALUE)
                                .collect(Collectors.toList());

                long totalGlobalProducts = projections.stream()
                                .filter(projection -> projection.getCustomerName() != null)
                                .mapToLong(CustomerProductStatusStatisticsProjection::getTotalProducts)
                                .sum();

                return NMDCustomerStatisticalResponse.builder()
                                .customers(customerStats)
                                .limit(limit)
                                .totalGlobalProducts(totalGlobalProducts)
                                .build();
        }

        public List<PlanSummaryDto> getProductPlansWithNullActualFaSubmitDate() {
                List<ProductPlanProjection> projections = productPlanRepository
                                .findProductPlansWithNullActualFaSubmitDate();

                return projections.stream()
                                .map(projection -> PlanSummaryDto.builder()
                                                .id(projection.getPlanId())
                                                .modelId(projection.getModelId())
                                                .productId(projection.getProductId())
                                                .name(projection.getPlanName())
                                                .typePlanDescription(projection.getPlanType() == null
                                                                ? null
                                                                : projection.getPlanType().name())
                                                .productCode(projection.getProductCode())
                                                .modelCode(projection.getModelCode())
                                                .createdBy(projection.getCreatedBy())
                                                .status(projection.getPlanStatus() == null ? null
                                                                : HtmpStatus.valueOf(projection.getPlanStatus())
                                                                                .getDescription())
                                                .build())
                                .toList();
        }
}
