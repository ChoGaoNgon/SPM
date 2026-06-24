package htmp.codien.quanlycodien.modules.newmodel.plan.service.inspection;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.common.enums.HtmpStatus;
import htmp.codien.quanlycodien.common.exception.ConflictException;
import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.infrastructure.storage.FileStorageService;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productFaInspection.ProductInspectionDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productFaInspection.ProductInspectionDefectDetailDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productFaInspection.ProductInspectionResponse;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanInspection;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanInspectionDefectDetail;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductDefectCode;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductDefectCodeRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductFaInspectionRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.enums.FileUploadProductType;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.InspectionDefectType;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationEvent;
import htmp.codien.quanlycodien.modules.notification.service.NotificationTriggerEvent;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductInspectionServerImpl implements ProductInspectionService {

    public static final int INSPECTION_DEADLINE_DAYS = 3;

    private final ProductFaInspectionRepository faInspectionRepository;
    private final EmployeeRepository employeeRepository;
    private final ModelMapper modelMapper;
    private final ProductPlanRepository planRepository;
    private final FileStorageService fileStorageService;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final ProductDefectCodeRepository defectCodeRepository;

    @Override
    @Transactional
    public void receiveFaInspection(Long trialPlanId) {
        try {

            ProductPlan plan = planRepository.findById(trialPlanId)
                    .orElseThrow(() -> new RuntimeException("Kế hoạch thử khuôn không tồn tại"));

            if (faInspectionRepository.existsByPlanId(trialPlanId)) {
                throw new ConflictException("Kế hoạch này đã có FA Inspection rồi");
            }

            ProductPlanInspection inspection = new ProductPlanInspection();
            inspection.setId(null);
            inspection.setPlan(plan);

            inspection.setReceivedDate(LocalDateTime.now());
            inspection.setInspectionDeadline(inspection.getReceivedDate().plusDays(INSPECTION_DEADLINE_DAYS));

            inspection.setDefectDetails(new ArrayList<>());

            ProductPlanInspection saveFaInspection = faInspectionRepository.save(inspection);
            if (saveFaInspection.getFinalResult() != null) {
                plan.setStatus(HtmpStatus.WAITTINGAPPROVALRESULT);
                planRepository.save(plan);
            }

            sendNotification(NotificationEvent.PRODUCT_PLAN_QC_UPDATE, plan);

        } catch (ConflictException | ResourceNotFoundException e) {

            throw e;
        } catch (Exception e) {

            throw new RuntimeException("Lỗi khi tạo FA mới: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void updateFaInspection(Long id, ProductInspectionDTO req, MultipartFile file) {
        try {

            ProductPlanInspection faInspection = faInspectionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Thông tin kiểm tra FA không tồn tại."));

            faInspection.setVisualCheckedBy(null);
            faInspection.setDimensionCheckedBy(null);
            faInspection.setReceivedByEmployee(null);
            faInspection.setFinalCheckedBy(null);

            modelMapper.map(req, faInspection);

            if (req.getVisualCheckedById() != null) {
                Employee e = employeeRepository.findById(req.getVisualCheckedById())
                        .orElseThrow(
                                () -> new ResourceNotFoundException("Nhân viên kiểm tra ngoại quan không tồn tại."));
                faInspection.setVisualCheckedBy(e);
            } else {
                faInspection.setVisualCheckedBy(null);
            }

            if (req.getDimensionCheckedById() != null) {
                Employee e = employeeRepository.findById(req.getDimensionCheckedById())
                        .orElseThrow(
                                () -> new ResourceNotFoundException("Nhân viên kiểm tra kích thước không tồn tại."));
                faInspection.setDimensionCheckedBy(e);
            } else {
                faInspection.setDimensionCheckedBy(null);
            }

            if (req.getFactoryCheckedById() != null) {
                Employee e = employeeRepository.findById(req.getFactoryCheckedById())
                        .orElseThrow(
                                () -> new ResourceNotFoundException("Nhân viên kiểm tra kích thước không tồn tại."));
                faInspection.setFactoryCheckedBy(e);
            } else {
                faInspection.setFactoryCheckedBy(null);
            }

            if (req.getReceivedByEmployeeId() != null) {
                Employee e = employeeRepository.findById(req.getReceivedByEmployeeId())
                        .orElseThrow(() -> new ResourceNotFoundException("Nhân viên nhận mẫu không tồn tại."));
                faInspection.setReceivedByEmployee(e);
            } else {
                faInspection.setReceivedByEmployee(null);
            }

            if (req.getFinalCheckedById() != null) {
                Employee e = employeeRepository.findById(req.getFinalCheckedById())
                        .orElseThrow(
                                () -> new ResourceNotFoundException("Nhân viên kiểm tra cuối cùng không tồn tại."));
                faInspection.setFinalCheckedBy(e);
            } else {
                faInspection.setFinalCheckedBy(null);
            }

            faInspection.setId(id);

            syncDefectDetails(faInspection, req);

            if (file != null && !file.isEmpty()) {

                if (faInspection.getFilePath() != null) {
                    fileStorageService.deleteFile(faInspection.getFilePath());
                }
                String filePath = fileStorageService.saveProductAttachment(
                        faInspection.getPlan().getProduct().getModel().getCode(),
                        faInspection.getPlan().getProduct().getCode(),
                        faInspection.getPlan().getName(),
                        FileUploadProductType.FA,
                        file);
                faInspection.setFilePath(filePath);
            }

            ProductPlanInspection saveFaInspection = faInspectionRepository.save(faInspection);
            ProductPlan plan = planRepository.findById(saveFaInspection.getPlan().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Kế hoạch thử khuôn không tồn tại"));
            if (saveFaInspection.getFinalResult() != null) {
                plan.setStatus(HtmpStatus.WAITTINGAPPROVALRESULT);
                planRepository.save(plan);
            }

            sendNotification(NotificationEvent.PRODUCT_PLAN_QC_UPDATE, plan);

        } catch (ConflictException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi cập nhật FA: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public ProductInspectionResponse getDetailFaInspectionById(Long id) {
        try {

            ProductPlanInspection faInspection = faInspectionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Thông tin kiểm tra FA không tồn tại."));

            ProductInspectionResponse response = modelMapper.map(faInspection, ProductInspectionResponse.class);

            if (faInspection.getPlan() != null) {
                response.setTrialPlanId(faInspection.getPlan().getId());
            }

            if (faInspection.getVisualCheckedBy() != null) {
                response.setVisualCheckedById(faInspection.getVisualCheckedBy().getId());
                response.setVisualCheckedByCode(faInspection.getVisualCheckedBy().getCode());
                response.setVisualCheckedByName(faInspection.getVisualCheckedBy().getName());
            }

            if (faInspection.getDimensionCheckedBy() != null) {
                response.setDimensionCheckedById(faInspection.getDimensionCheckedBy().getId());
                response.setDimensionCheckedByCode(faInspection.getDimensionCheckedBy().getCode());
                response.setDimensionCheckedByName(faInspection.getDimensionCheckedBy().getName());
            }

            if (faInspection.getReceivedByEmployee() != null) {
                response.setReceivedByEmployeeId(faInspection.getReceivedByEmployee().getId());
                response.setReceivedByEmployeeCode(faInspection.getReceivedByEmployee().getCode());
                response.setReceivedByEmployeeName(faInspection.getReceivedByEmployee().getName());
            }

            if (faInspection.getFinalCheckedBy() != null) {
                response.setFinalCheckedById(faInspection.getFinalCheckedBy().getId());
                response.setFinalCheckedByCode(faInspection.getFinalCheckedBy().getCode());
                response.setFinalCheckedByName(faInspection.getFinalCheckedBy().getName());
            }

            if (faInspection.getFactoryCheckedBy() != null) {
                response.setFactoryCheckedById(faInspection.getFactoryCheckedBy().getId());
                response.setFactoryCheckedByCode(faInspection.getFactoryCheckedBy().getCode());
                response.setFactoryCheckedByName(faInspection.getFactoryCheckedBy().getName());
            }

            populateDefectDetails(response, faInspection);

            return response;

        } catch (ConflictException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy chi tiết FA Inspection: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public ProductInspectionResponse getFaInspectionByTrialPlanId(Long trialPlanId) {
        try {

            ProductPlanInspection faInspection = faInspectionRepository.findLatestByPlanId(trialPlanId).orElse(null);
            if (faInspection == null) {
                throw new ResourceNotFoundException(
                        "Không tìm thấy FA Inspection cho Trial Plan ID: " + trialPlanId);
            }

            ProductInspectionResponse res = modelMapper.map(faInspection, ProductInspectionResponse.class);

            if (faInspection.getPlan() != null) {
                res.setTrialPlanId(faInspection.getPlan().getId());
            }
            if (faInspection.getVisualCheckedBy() != null) {
                res.setVisualCheckedByCode(faInspection.getVisualCheckedBy().getCode());
                res.setVisualCheckedByName(faInspection.getVisualCheckedBy().getName());
            }
            if (faInspection.getDimensionCheckedBy() != null) {
                res.setDimensionCheckedByCode(faInspection.getDimensionCheckedBy().getCode());
                res.setDimensionCheckedByName(faInspection.getDimensionCheckedBy().getName());
            }
            if (faInspection.getReceivedByEmployee() != null) {
                res.setReceivedByEmployeeCode(faInspection.getReceivedByEmployee().getCode());
                res.setReceivedByEmployeeName(faInspection.getReceivedByEmployee().getName());
            }
            if (faInspection.getFinalCheckedBy() != null) {
                res.setFinalCheckedByCode(faInspection.getFinalCheckedBy().getCode());
                res.setFinalCheckedByName(faInspection.getFinalCheckedBy().getName());
            }
            if (faInspection.getFactoryCheckedBy() != null) {
                res.setFactoryCheckedByCode(faInspection.getFactoryCheckedBy().getCode());
                res.setFactoryCheckedByName(faInspection.getFactoryCheckedBy().getName());
            }

            populateDefectDetails(res, faInspection);

            res.setNgRate(
                    res.getNgQuantity() != null
                            && res.getInspectedQuantity() != null
                            && res.getInspectedQuantity() > 0
                                    ? BigDecimal.valueOf(res.getNgQuantity())
                                            .divide(BigDecimal.valueOf(res.getInspectedQuantity()), 6,
                                                    RoundingMode.HALF_UP)
                                            .multiply(BigDecimal.valueOf(100))
                                            .setScale(4, RoundingMode.HALF_UP)
                                            .doubleValue()
                                    : 0.0);

            return res;

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy FA Inspection: " + e.getMessage(), e);
        }
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

    private void syncDefectDetails(ProductPlanInspection inspection, ProductInspectionDTO req) {
        if (inspection.getDefectDetails() == null) {
            inspection.setDefectDetails(new ArrayList<>());
        } else {
            inspection.getDefectDetails().clear();
        }

        List<ProductInspectionDefectDetailDTO> allDetails = new ArrayList<>();
        if (req.getVisualDefectDetails() != null) {
            allDetails.addAll(req.getVisualDefectDetails());
        }
        if (req.getDimensionDefectDetails() != null) {
            allDetails.addAll(req.getDimensionDefectDetails());
        }

        Map<Long, ProductDefectCode> defectCodeMap = defectCodeRepository.findAllById(
                allDetails.stream()
                        .map(ProductInspectionDefectDetailDTO::getDefectCodeId)
                        .filter(java.util.Objects::nonNull)
                        .distinct()
                        .toList())
                .stream()
                .collect(Collectors.toMap(ProductDefectCode::getId, Function.identity()));

        appendDefectDetails(inspection, req.getVisualDefectDetails(), defectCodeMap, InspectionDefectType.VISUAL);
        appendDefectDetails(inspection, req.getDimensionDefectDetails(), defectCodeMap, InspectionDefectType.DIMENSION);
    }

    private void appendDefectDetails(ProductPlanInspection inspection, List<ProductInspectionDefectDetailDTO> details,
            Map<Long, ProductDefectCode> defectCodeMap, InspectionDefectType defectType) {
        if (details == null || details.isEmpty()) {
            return;
        }

        for (ProductInspectionDefectDetailDTO detailDto : details) {
            if (detailDto.getDefectCodeId() == null) {
                continue;
            }

            ProductDefectCode defectCode = defectCodeMap.get(detailDto.getDefectCodeId());
            if (defectCode == null) {
                throw new ResourceNotFoundException("Một hoặc nhiều mã lỗi không tồn tại");
            }

            ProductPlanInspectionDefectDetail detail = ProductPlanInspectionDefectDetail.builder()
                    .inspection(inspection)
                    .defectCode(defectCode)
                    .defectType(defectType)
                    .quantity(detailDto.getQuantity() != null ? detailDto.getQuantity() : 1)
                    .note(detailDto.getNote())
                    .build();

            inspection.getDefectDetails().add(detail);
        }
    }

    private void populateDefectDetails(ProductInspectionResponse response, ProductPlanInspection inspection) {
        List<ProductPlanInspectionDefectDetail> defectDetails = inspection.getDefectDetails();
        if (defectDetails == null || defectDetails.isEmpty()) {
            response.setDefectCodes(List.of());
            response.setVisualDefectDetails(List.of());
            response.setDimensionDefectDetails(List.of());
            return;
        }

        List<ProductInspectionDefectDetailDTO> visualDefectDetails = mapDefectDetailsByType(defectDetails,
                InspectionDefectType.VISUAL);
        List<ProductInspectionDefectDetailDTO> dimensionDefectDetails = mapDefectDetailsByType(defectDetails,
                InspectionDefectType.DIMENSION);

        response.setVisualDefectDetails(visualDefectDetails);
        response.setDimensionDefectDetails(dimensionDefectDetails);
        response.setDefectCodes(defectDetails.stream()
                .map(ProductPlanInspectionDefectDetail::getDefectCode)
                .collect(Collectors.toMap(
                        ProductDefectCode::getId,
                        dc -> new ProductInspectionResponse.DefectCodeInfo(dc.getId(), dc.getCode(),
                                dc.getDescription()),
                        (left, right) -> left,
                        java.util.LinkedHashMap::new))
                .values()
                .stream()
                .toList());
    }

    private List<ProductInspectionDefectDetailDTO> mapDefectDetailsByType(
            List<ProductPlanInspectionDefectDetail> defectDetails,
            InspectionDefectType defectType) {
        return defectDetails.stream()
                .filter(detail -> detail.getDefectType() == defectType)
                .map(detail -> ProductInspectionDefectDetailDTO.builder()
                        .id(detail.getId())
                        .defectCodeId(detail.getDefectCode() != null ? detail.getDefectCode().getId() : null)
                        .defectCode(detail.getDefectCode() != null ? detail.getDefectCode().getCode() : null)
                        .defectCodeDescription(
                                detail.getDefectCode() != null ? detail.getDefectCode().getDescription() : null)
                        .quantity(detail.getQuantity())
                        .note(detail.getNote())
                        .build())
                .collect(Collectors.toList());
    }

}
