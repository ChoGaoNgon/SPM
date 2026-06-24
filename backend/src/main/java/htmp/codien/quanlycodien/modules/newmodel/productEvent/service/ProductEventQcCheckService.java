package htmp.codien.quanlycodien.modules.newmodel.productEvent.service;

import htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.productEventQcCheck.ProductEventQcCheckRequest;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.productEventQcCheck.ProductEventQcCheckResponse;

public interface ProductEventQcCheckService {
    void createEventQcCheck(Long eventId, ProductEventQcCheckRequest req);

    void updateEventQcCheck(Long id, ProductEventQcCheckRequest req);

    ProductEventQcCheckResponse getEventQcCheckById(Long id);

    ProductEventQcCheckResponse getEventQcCheckByEventId(Long eventId);

    void approveShipping(Long id);
}
