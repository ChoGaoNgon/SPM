package htmp.codien.quanlycodien.modules.newmodel.plan.service.inspection;

import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productFaInspection.ProductInspectionDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productFaInspection.ProductInspectionResponse;

public interface ProductInspectionService {

    void updateFaInspection(Long id, ProductInspectionDTO req, MultipartFile file);

    ProductInspectionResponse getDetailFaInspectionById(Long id);

    ProductInspectionResponse getFaInspectionByTrialPlanId(Long trialPlanId);

    void receiveFaInspection(Long planId);
}
