package htmp.codien.quanlycodien.modules.newmodel.plan.service;

import java.util.List;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.ProductPlanApprovalTemplateDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanApprovalTemplateRequest;

public interface ProductPlanApprovalTemplateService {

    List<ProductPlanApprovalTemplateDTO> getAllTemplates();

    ProductPlanApprovalTemplateDTO getTemplateById(Long id);

    ProductPlanApprovalTemplateDTO createTemplate(ProductPlanApprovalTemplateRequest request);

    ProductPlanApprovalTemplateDTO updateTemplate(Long id, ProductPlanApprovalTemplateRequest request);

    void deleteTemplate(Long id);

    void reorderTemplates(List<Long> templateIds);
}
