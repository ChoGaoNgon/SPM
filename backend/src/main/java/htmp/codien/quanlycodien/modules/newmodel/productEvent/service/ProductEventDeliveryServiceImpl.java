package htmp.codien.quanlycodien.modules.newmodel.productEvent.service;

import org.springframework.stereotype.Service;

import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanRepository;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.productEvent.ProductEventDeliveryDTO;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.entity.ProductEventDelivery;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.repository.ProductEventDeliveryRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductEventDeliveryServiceImpl implements ProductEventDeliveryService {
        private final ProductEventDeliveryRepository deliveryRepository;
        private final ProductPlanRepository planRepository;

        @Override
        public void createEventDelivery(Long eventId, ProductEventDeliveryDTO req) {
                ProductPlan event = planRepository.findById(eventId)
                                .orElseThrow(() -> new RuntimeException("Event không tồn tại"));

                ProductEventDelivery delivery = ProductEventDelivery.builder()
                                .plan(event)
                                .expectedDeliveryDate(req.getExpectedDeliveryDate())
                                .actualDeliveryDate(req.getActualDeliveryDate())
                                .actualQuantityDelivery(req.getActualQuantityDelivery())
                                .feedbackRemark(req.getFeedbackRemark())
                                .feedbackResult(req.getFeedbackResult() != null ? req.getFeedbackResult().toString()
                                                : null)
                                .build();

                deliveryRepository.save(delivery);
        }

        @Override
        public ProductEventDeliveryDTO getEventDeliveryByEventId(Long eventId) {
                return deliveryRepository.findByPlanId(eventId)
                                .map(this::convertToDTO)
                                .orElse(null);
        }

        @Override
        public void updateEventDelivery(Long eventId, ProductEventDeliveryDTO req) {
                ProductEventDelivery delivery = deliveryRepository.findByPlanId(eventId)
                                .orElseThrow(() -> new RuntimeException("Thông tin giao hàng không tồn tại"));

                delivery.setExpectedDeliveryDate(req.getExpectedDeliveryDate());
                delivery.setActualDeliveryDate(req.getActualDeliveryDate());
                delivery.setActualQuantityDelivery(req.getActualQuantityDelivery());
                delivery.setFeedbackRemark(req.getFeedbackRemark());
                delivery.setFeedbackResult(req.getFeedbackResult() != null ? req.getFeedbackResult().toString() : null);

                deliveryRepository.save(delivery);
        }

        private ProductEventDeliveryDTO convertToDTO(ProductEventDelivery delivery) {
                return ProductEventDeliveryDTO.builder()
                                .expectedDeliveryDate(delivery.getExpectedDeliveryDate())
                                .actualDeliveryDate(delivery.getActualDeliveryDate())
                                .actualQuantityDelivery(delivery.getActualQuantityDelivery())
                                .feedbackRemark(delivery.getFeedbackRemark())
                                .feedbackResult(delivery.getFeedbackResult() != null
                                                ? htmp.codien.quanlycodien.common.enums.HtmpResult
                                                                .valueOf(delivery.getFeedbackResult())
                                                : null)
                                .build();
        }
}
