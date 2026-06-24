package htmp.codien.quanlycodien.modules.newmodel.plan.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.productEvent.ProductEventDeliveryDTO;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.service.ProductEventDeliveryService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/product-events")
@RequiredArgsConstructor
public class ProductEventDeliveryController {
    private final ProductEventDeliveryService deliveryService;

    @PostMapping("/{eventId}/delivery")
    public ResponseEntity<ApiResponse<Void>> createEventDelivery(
            @PathVariable Long eventId,
            @RequestBody ProductEventDeliveryDTO req) {
        deliveryService.createEventDelivery(eventId, req);
        return ResponseUtil.success(null, "Tạo thông tin giao hàng thành công");
    }

    @GetMapping("/{eventId}/delivery")
    public ResponseEntity<ApiResponse<ProductEventDeliveryDTO>> getEventDelivery(
            @PathVariable Long eventId) {
        ProductEventDeliveryDTO delivery = deliveryService.getEventDeliveryByEventId(eventId);
        return ResponseUtil.success(delivery, "Lấy thông tin giao hàng thành công");
    }

    @PutMapping("/{eventId}/delivery")
    public ResponseEntity<ApiResponse<Void>> updateEventDelivery(
            @PathVariable Long eventId,
            @RequestBody ProductEventDeliveryDTO req) {
        deliveryService.updateEventDelivery(eventId, req);
        return ResponseUtil.success(null, "Cập nhật thông tin giao hàng thành công");
    }

    @PatchMapping("/{eventId}/delivery")
    public ResponseEntity<ApiResponse<Void>> patchEventDelivery(
            @PathVariable Long eventId,
            @RequestBody ProductEventDeliveryDTO req) {
        deliveryService.updateEventDelivery(eventId, req);
        return ResponseUtil.success(null, "Cập nhật thông tin giao hàng thành công");
    }

}
