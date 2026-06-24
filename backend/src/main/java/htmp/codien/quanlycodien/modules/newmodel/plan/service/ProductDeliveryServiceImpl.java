package htmp.codien.quanlycodien.modules.newmodel.plan.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.modelmapper.ModelMapper;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.common.enums.HtmpResult;
import htmp.codien.quanlycodien.common.exception.ConflictException;
import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.infrastructure.storage.FileStorageService;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productDelivery.ProductDeliveryDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productDelivery.ProductDeliveryResponse;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanInspection;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductDelivery;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductDeliveryRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductFaInspectionRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.enums.FileUploadProductType;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationEvent;
import htmp.codien.quanlycodien.modules.notification.service.NotificationTriggerEvent;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductDeliveryServiceImpl implements ProductDeliveryService {
    private final ProductDeliveryRepository deliveryRepository;
    private final ProductFaInspectionRepository faInspectionRepository;
    private final ModelMapper modelMapper;
    private final ProductPlanRepository productlPlanRepository;
    private final FileStorageService fileStorageService;
    private final ApplicationEventPublisher applicationEventPublisher;

    @Override
    public void createDelivery(Long faInspectionId, ProductDeliveryDTO req, MultipartFile feedbackFile,
            MultipartFile conditionFile) {
        try {
            ProductPlanInspection inspection = faInspectionRepository.findById(faInspectionId)
                    .orElseThrow(() -> new RuntimeException("Thông tin kiểm tra fa không tồn tại"));

            if (deliveryRepository.existsByInspectionId(faInspectionId)) {
                throw new ConflictException(
                        "Thông tin giao hàng cho kiểm tra FA này đã tồn tại. Vui lòng cập nhật thay vì tạo mới.");
            }

            ProductDelivery delivery = modelMapper.map(req, ProductDelivery.class);
            delivery.setInspection(inspection);

            if (feedbackFile != null && !feedbackFile.isEmpty()) {
                String fileUrl = fileStorageService.saveProductAttachment(
                        inspection.getPlan().getProduct().getModel().getCode(),
                        inspection.getPlan().getProduct().getCode(),
                        inspection.getPlan().getName(),
                        FileUploadProductType.FA,
                        feedbackFile);
                delivery.setFeedbackFileUrl(fileUrl);
            }

            if (conditionFile != null && !conditionFile.isEmpty()) {
                String conditionUrl = fileStorageService.saveProductAttachment(
                        inspection.getPlan().getProduct().getModel().getCode(),
                        inspection.getPlan().getProduct().getCode(),
                        inspection.getPlan().getName(),
                        FileUploadProductType.FA,
                        conditionFile);
                delivery.setConditionFileUrl(conditionUrl);
            }

            ProductDelivery savedDelivery = deliveryRepository.save(delivery);

            sendNotification(NotificationEvent.PRODUCT_PLAN_DELIVERY_UPDATE, savedDelivery.getInspection().getPlan());

        } catch (ConflictException | ResourceNotFoundException e) {

            throw e;
        } catch (Exception e) {

            throw new RuntimeException("Lỗi khi tạo thông tin giao hàng FA: " + e.getMessage(), e);
        }
    }

    @Override
    public void updateDelivery(Long id, ProductDeliveryDTO req, MultipartFile feedbackFile,
            MultipartFile conditionFile) {
        try {

            ProductDelivery existing = deliveryRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Thông tin giao hàng FA không tồn tại"));

            if (conditionFile != null && !conditionFile.isEmpty()) {
                if (existing.getConditionFileApprovalResult() == HtmpResult.OK ||
                        existing.getConditionFileApprovalResult() == HtmpResult.NG) {
                    throw new ConflictException("Không thể thay đổi file điều kiện đúc vì đã được duyệt");
                }
            }

            modelMapper.map(req, existing);

            if (feedbackFile != null && !feedbackFile.isEmpty()) {
                String newFileUrl = fileStorageService.saveProductAttachment(
                        existing.getInspection().getPlan().getProduct().getModel().getCode(),
                        existing.getInspection().getPlan().getProduct().getCode(),
                        existing.getInspection().getPlan().getName(),
                        FileUploadProductType.FA,
                        feedbackFile);

                if (existing.getFeedbackFileUrl() != null) {
                    fileStorageService.deleteFile(existing.getFeedbackFileUrl());
                }

                existing.setFeedbackFileUrl(newFileUrl);
            }

            if (conditionFile != null && !conditionFile.isEmpty()) {
                String newConditionUrl = fileStorageService.saveProductAttachment(
                        existing.getInspection().getPlan().getProduct().getModel().getCode(),
                        existing.getInspection().getPlan().getProduct().getCode(),
                        existing.getInspection().getPlan().getName(),
                        FileUploadProductType.FA,
                        conditionFile);

                if (existing.getConditionFileUrl() != null) {
                    fileStorageService.deleteFile(existing.getConditionFileUrl());
                }

                existing.setConditionFileUrl(newConditionUrl);
            }

            deliveryRepository.save(existing);

            sendNotification(NotificationEvent.PRODUCT_PLAN_DELIVERY_UPDATE, existing.getInspection().getPlan());

        } catch (ConflictException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi cập nhật thông tin giao hàng FA: " + e.getMessage(), e);
        }
    }

    @Override
    public ProductDeliveryResponse getDetailDeliveryById(Long id) {
        try {
            ProductDelivery delivery = deliveryRepository.findById(id)
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Không tìm thấy thông tin giao hàng với ID: " + id));
            return modelMapper.map(delivery, ProductDeliveryResponse.class);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy chi tiết giao hàng FA: " + e.getMessage(), e);
        }
    }

    @Override
    public ProductDeliveryResponse getAllDeliveryByMoldTrialPlanId(Long moldTrialPlanId) {
        try {
            productlPlanRepository.findById(moldTrialPlanId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy kế hoạch thử khuôn : " + moldTrialPlanId));

            ProductDelivery delivery = deliveryRepository.findByMoldTrialPlanId(moldTrialPlanId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không có giao hàng FA cho kế hoạch thử khuôn ID: " + moldTrialPlanId));

            return modelMapper.map(delivery, ProductDeliveryResponse.class);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy danh sách giao hàng FA theo moldtrialPlan ID: " + e.getMessage(),
                    e);
        }
    }

    @Override
    public void approveConditionFile(Long id, ProductDeliveryDTO req) {
        try {
            ProductDelivery delivery = deliveryRepository.findById(id)
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Không tìm thấy thông tin giao hàng FA với ID: " + id));

            if (delivery.getConditionFileApprovalResult() == HtmpResult.OK ||
                    delivery.getConditionFileApprovalResult() == HtmpResult.NG) {
                throw new ConflictException("File điều kiện đúc đã được duyệt, không thể duyệt lại");
            }

            if (req.getConditionFileApprovalResult() != null) {
                delivery.setConditionFileApprovalResult(req.getConditionFileApprovalResult());
            }

            if (req.getConditionFileApprovedBy() != null) {
                delivery.setConditionFileApprovedBy(req.getConditionFileApprovedBy());
            }

            if (req.getConditionFileApprovalNote() != null) {
                delivery.setConditionFileApprovalNote(req.getConditionFileApprovalNote());
            }

            if (req.getConditionFileApprovalResult() == HtmpResult.OK
                    || req.getConditionFileApprovalResult() == HtmpResult.NG) {
                delivery.setConditionFileApprovedAt(LocalDateTime.now());
            }

            deliveryRepository.save(delivery);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi duyệt file điều kiện đúc: " + e.getMessage(), e);
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
}
