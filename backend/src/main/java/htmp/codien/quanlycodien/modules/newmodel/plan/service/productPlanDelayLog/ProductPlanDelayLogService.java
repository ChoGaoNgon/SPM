package htmp.codien.quanlycodien.modules.newmodel.plan.service.productPlanDelayLog;

import java.util.List;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanDelayLogRespopnse;

public interface ProductPlanDelayLogService {
    List<ProductPlanDelayLogRespopnse> getDelayLogsByPlanId(Long planId);
}
