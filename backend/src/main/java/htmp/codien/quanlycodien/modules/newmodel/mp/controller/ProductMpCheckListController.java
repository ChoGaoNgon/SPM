package htmp.codien.quanlycodien.modules.newmodel.mp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.common.annotation.RequiresPermission;
import htmp.codien.quanlycodien.modules.newmodel.mp.dto.productMpCheckList.ProductMpApprovalRequest;
import htmp.codien.quanlycodien.modules.newmodel.mp.dto.productMpCheckList.ProductMpCheckListResponse;
import htmp.codien.quanlycodien.modules.newmodel.mp.service.ProductMpCheckListService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/mp-checklists")
@RequiredArgsConstructor
public class ProductMpCheckListController {
    private final ProductMpCheckListService productMpCheckListService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<ProductMpCheckListResponse>> getByProductId(@PathVariable Long productId) {
        ProductMpCheckListResponse result = productMpCheckListService.getByProductId(productId);
        return ResponseUtil.success(result, "Lấy danh sách kiểm tra MP thành công");
    }

    @PostMapping("/product/{productId}")
    @RequiresPermission("NMD_PRODUCT_MP_CHECKLIST_CREATE")
    public ResponseEntity<ApiResponse<Void>> createMpCheckList(@PathVariable Long productId,
            @RequestParam String delayReason) {
        productMpCheckListService.createMpCheckList(productId, delayReason);
        return ResponseUtil.success(null, "Thêm kiểm tra MP thành công");
    }

    @DeleteMapping("/product/{productId}")
    @RequiresPermission("NMD_PRODUCT_MP_CHECKLIST_DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteByProductId(@PathVariable Long productId) {
        productMpCheckListService.deleteByProductId(productId);
        return ResponseUtil.success(null, "Xóa danh sách kiểm tra MP thành công");
    }

    @PutMapping("/approval/{approvalId}/approve")
    @RequiresPermission("NMD_PRODUCT_MP_CHECKLIST_APPROVAL")
    public ResponseEntity<ApiResponse<Void>> approveCheckList(@PathVariable Long approvalId,
            @RequestBody ProductMpApprovalRequest request) {
        productMpCheckListService.approveCheckList(approvalId, request.getComment());
        return ResponseUtil.success(null, "Phê duyệt thành công");
    }

    @PutMapping("/approval/{approvalId}/reject")
    @RequiresPermission("NMD_PRODUCT_MP_CHECKLIST_APPROVAL")
    public ResponseEntity<ApiResponse<Void>> rejectCheckList(@PathVariable Long approvalId,
            @RequestBody ProductMpApprovalRequest request) {
        productMpCheckListService.rejectCheckList(approvalId, request.getComment());
        return ResponseUtil.success(null, "Từ chối thành công");
    }

}
