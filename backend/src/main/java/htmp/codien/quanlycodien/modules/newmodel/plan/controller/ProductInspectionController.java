package htmp.codien.quanlycodien.modules.newmodel.plan.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.common.annotation.RequiresPermission;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productFaInspection.ProductInspectionDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productFaInspection.ProductInspectionResponse;
import htmp.codien.quanlycodien.modules.newmodel.plan.service.inspection.ProductInspectionService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/inspection")
@RequiredArgsConstructor
public class ProductInspectionController {
    private final ProductInspectionService productInspectionService;

    @PostMapping("/plan/{planId}/receive")
    @RequiresPermission("NMD_PRODUCT_PLAN_FA_INSPECTION_RECEIVE")
    public ResponseEntity<ApiResponse<Void>> receiveFaInspection(@PathVariable Long planId) {
        productInspectionService.receiveFaInspection(planId);
        return ResponseUtil.success(null, "Nhận kiểm tra FA thành công");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ProductInspectionResponse>> getFaInspectionByTrialPlanId(
            @RequestParam Long trialPlanId) {
        ProductInspectionResponse res = productInspectionService.getFaInspectionByTrialPlanId(trialPlanId);
        return ResponseUtil.success(res, "Lấy danh sách kiểm tra FA thành công");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductInspectionResponse>> getDetailFaInspectionById(
            @PathVariable Long id) {
        ProductInspectionResponse res = productInspectionService.getDetailFaInspectionById(id);
        return ResponseUtil.success(res, "Lấy thông tin kiểm tra FA id: " + id + " thành công");
    }

    @PutMapping("/{id}")
    @RequiresPermission("NMD_PRODUCT_PLAN_FA_INSPECTION_UPDATE")
    public ResponseEntity<ApiResponse<Void>> updateFaInspection(@PathVariable Long id,
            @RequestPart("data") ProductInspectionDTO req,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        productInspectionService.updateFaInspection(id, req, file);
        return ResponseUtil.success(null, "Cập nhật thông tin kiểm tra FA thành công");
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("NMD_PRODUCT_PLAN_FA_INSPECTION_DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteFaInspection(@PathVariable Long id) {

        return ResponseUtil.success(null, "Xóa kiểm tra FA thành công");
    }
}
