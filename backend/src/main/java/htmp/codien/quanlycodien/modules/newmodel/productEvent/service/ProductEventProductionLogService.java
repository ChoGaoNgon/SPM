package htmp.codien.quanlycodien.modules.newmodel.productEvent.service;

import java.util.List;

import htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.ProductEventProductionLog.ProductEventProductionLogRequest;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.ProductEventProductionLog.ProductEventProductionLogResponse;

public interface ProductEventProductionLogService {
    void createLog(Long eventId, ProductEventProductionLogRequest req);

    void updateLog(Long id, ProductEventProductionLogRequest req);

    ProductEventProductionLogResponse getLogById(Long id);

    List<ProductEventProductionLogResponse> getAllLogByPlanId(Long planId);

}