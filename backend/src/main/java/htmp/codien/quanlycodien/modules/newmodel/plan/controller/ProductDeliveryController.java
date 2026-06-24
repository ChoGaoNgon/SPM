package htmp.codien.quanlycodien.modules.newmodel.plan.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.common.annotation.RequiresPermission;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productDelivery.ProductDeliveryDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productDelivery.ProductDeliveryResponse;
import htmp.codien.quanlycodien.modules.newmodel.plan.service.ProductDeliveryService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/product-delivery")
@RequiredArgsConstructor
public class ProductDeliveryController {
    private final ProductDeliveryService deliveryService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RequiresPermission("NMD_PRODUCT_PLAN_FA_DELIVERY_CREATE")
    public ResponseEntity<ApiResponse<Void>> createFaDelivery(
            @RequestParam Long faInspectionId,
            @RequestPart("data") ProductDeliveryDTO req,
            @RequestPart(value = "feedbackFile", required = false) MultipartFile feedbackFile,
            @RequestPart(value = "conditionFile", required = false) MultipartFile conditionFile) {
        deliveryService.createDelivery(faInspectionId, req, feedbackFile, conditionFile);
        return ResponseUtil.success(null, "Thêm mới Thồng tin giao hàng FA thành công");
    }

    @PutMapping("/{id}")
    @RequiresPermission("NMD_PRODUCT_PLAN_FA_DELIVERY_UPDATE")
    public ResponseEntity<ApiResponse<Void>> updateFaDelivery(
            @PathVariable Long id,
            @RequestPart("data") ProductDeliveryDTO req,
            @RequestPart(value = "feedbackFile", required = false) MultipartFile feedbackFile,
            @RequestPart(value = "conditionFile", required = false) MultipartFile conditionFile) {
        deliveryService.updateDelivery(id, req, feedbackFile, conditionFile);
        return ResponseUtil.success(null, "Chỉnh sửa Thồng tin giao hàng FA fa thành công");
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("NMD_PRODUCT_PLAN_FA_DELIVERY_DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteFaDelivery(@PathVariable Long id) {

        return ResponseUtil.success(null, "Xóa Thông tin giao hàng FA thành công");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDeliveryResponse>> getDetailFaDeliveryById(
            @PathVariable Long id) {
        ProductDeliveryResponse res = deliveryService.getDetailDeliveryById(id);
        return ResponseUtil.success(res, "Lấy thông tin giao hàng FA với id" + id + " thành công");
    }

    @GetMapping()
    public ResponseEntity<ApiResponse<ProductDeliveryResponse>> getAllDeliveryByMoldTrialPlanId(
            @RequestParam Long moldTrialPlanId) {
        ProductDeliveryResponse res = deliveryService.getAllDeliveryByMoldTrialPlanId(moldTrialPlanId);
        return ResponseUtil.success(res, "Lấy danh sách thông tin giao hàng FA theo kế hoạch thử khuôn thành công");
    }

    @PatchMapping("/{id}/approve-condition-file")

    public ResponseEntity<ApiResponse<Void>> approveConditionFile(
            @PathVariable Long id,
            @RequestBody ProductDeliveryDTO req) {
        deliveryService.approveConditionFile(id, req);
        return ResponseUtil.success(null, "Duyệt file điều kiện đúc thành công");
    }
}
