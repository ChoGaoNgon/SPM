package htmp.codien.quanlycodien.modules.newmodel.plan.service;

import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productDelivery.ProductDeliveryDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productDelivery.ProductDeliveryResponse;

public interface ProductDeliveryService {
    void createDelivery(Long faInspectionId, ProductDeliveryDTO req, MultipartFile feedbackFile,
            MultipartFile conditionFile);

    void updateDelivery(Long id, ProductDeliveryDTO req, MultipartFile feedbackFile, MultipartFile conditionFile);

    ProductDeliveryResponse getDetailDeliveryById(Long id);

    ProductDeliveryResponse getAllDeliveryByMoldTrialPlanId(Long moldTrialPlanId);

    void approveConditionFile(Long id, ProductDeliveryDTO req);
}
