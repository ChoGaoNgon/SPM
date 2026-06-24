package htmp.codien.quanlycodien.modules.newmodel.plan.service;

import java.util.List;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanApproveResultBatchRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanApproveResultDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanApproveResultRequest;

public interface ProductPlanApproveResultService {

    List<ProductPlanApproveResultDTO> getApproveResultsByPlanId(Long planId);

    ProductPlanApproveResultDTO updateApproveResult(Long planId, String departmentCode,
            ProductPlanApproveResultRequest request);

    void batchUpdateApproveResults(Long planId, ProductPlanApproveResultBatchRequest batchRequest);

    void deleteApproveResult(Long planId, String departmentCode);
}