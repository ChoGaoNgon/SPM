package htmp.codien.quanlycodien.modules.newmodel.plan.service.productPlanDelayLog;

import java.util.List;

import org.springframework.stereotype.Service;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanDelayLogRespopnse;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanDelayLogRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductPlanDelayLogServiceImpl implements ProductPlanDelayLogService {

    private final ProductPlanDelayLogRepository productPlanDelayLogRepository;

    @Override
    public List<ProductPlanDelayLogRespopnse> getDelayLogsByPlanId(Long planId) {
        return productPlanDelayLogRepository.getDelayLogsByPlanId(planId);
    }

}
