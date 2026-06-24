package htmp.codien.quanlycodien.modules.newmodel.productEvent.service;

import htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.productEvent.ProductEventDeliveryDTO;

public interface ProductEventDeliveryService {
    void createEventDelivery(Long eventId, ProductEventDeliveryDTO req);

    ProductEventDeliveryDTO getEventDeliveryByEventId(Long eventId);

    void updateEventDelivery(Long eventId, ProductEventDeliveryDTO req);

}
