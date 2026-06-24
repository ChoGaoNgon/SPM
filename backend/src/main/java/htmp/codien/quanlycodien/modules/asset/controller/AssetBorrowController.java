package htmp.codien.quanlycodien.modules.asset.controller;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.common.annotation.RequiresPermission;
import htmp.codien.quanlycodien.modules.asset.dto.borrow.AssetBorrowCreationRequest;
import htmp.codien.quanlycodien.modules.asset.dto.borrow.AssetBorrowRejectRequest;
import htmp.codien.quanlycodien.modules.asset.dto.borrow.AssetBorrowResponse;
import htmp.codien.quanlycodien.modules.asset.dto.borrow.AssetBorrowUpdationRequest;
import htmp.codien.quanlycodien.modules.asset.enums.AssetBorrowStatus;
import htmp.codien.quanlycodien.modules.asset.service.AssetBorrowService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/asset-borrows")
@RequiredArgsConstructor
public class AssetBorrowController {

    private final AssetBorrowService assetBorrowService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createAssetBorrow(@RequestParam Long assetId,
            @RequestBody AssetBorrowCreationRequest request) {
        assetBorrowService.createAssetBorrow(assetId, request);
        return ResponseUtil.success(null, "Tạo đơn mượn tài sản thành công");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updateAssetBorrow(@PathVariable Long id,
            @RequestBody AssetBorrowUpdationRequest request) {
        assetBorrowService.updateAssetBorrow(id, request);
        return ResponseUtil.success(null, "Cập nhật đơn mượn tài sản thành công");
    }

    @PutMapping("/{id}/approve")
    @RequiresPermission("ASSET_BORROW_APPROVE")
    public ResponseEntity<ApiResponse<Void>> approveAssetBorrow(@PathVariable Long id) {
        assetBorrowService.approveAssetBorrow(id);
        return ResponseUtil.success(null, "Phê duyệt đơn mượn tài sản thành công");
    }

    @PutMapping("/{id}/reject")
    @RequiresPermission("ASSET_BORROW_APPROVE")
    public ResponseEntity<ApiResponse<Void>> rejectAssetBorrow(@PathVariable Long id,
            @RequestBody AssetBorrowRejectRequest req) {
        assetBorrowService.rejectAssetBorrow(id, req);
        return ResponseUtil.success(null, "Từ chối đơn mượn tài sản thành công");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AssetBorrowResponse>>> getAllAssetBorrows(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long requestById,
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) LocalDate borrowDate,
            @RequestParam(required = false) AssetBorrowStatus status) {
        Page<AssetBorrowResponse> assetBorrows = assetBorrowService.getAllAssetBorrows(pageable, keyword, requestById,
                date, borrowDate, status);
        return ResponseUtil.success(assetBorrows, "Lấy danh sách đơn mượn tài sản thành công");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssetBorrowResponse>> getAssetBorrowById(@PathVariable Long id) {
        AssetBorrowResponse assetBorrow = assetBorrowService.getAssetBorrowById(id);
        return ResponseUtil.success(assetBorrow, "Lấy đơn mượn tài sản thành công");
    }

    @GetMapping("/requested-by/{requestedById}")
    public ResponseEntity<ApiResponse<List<AssetBorrowResponse>>> getAssetBorrowsByRequestedById(
            @PathVariable Long requestedById) {
        List<AssetBorrowResponse> assetBorrows = assetBorrowService.getAssetBorrowsByRequestedById(requestedById);
        return ResponseUtil.success(assetBorrows, "Lấy danh sách đơn mượn theo nhân viên thành công");
    }

    @GetMapping("/asset/{assetId}")
    public ResponseEntity<ApiResponse<List<AssetBorrowResponse>>> getAssetBorrowsByAssetId(@PathVariable Long assetId) {
        List<AssetBorrowResponse> assetBorrows = assetBorrowService.getAssetBorrowsByAssetId(assetId);
        return ResponseUtil.success(assetBorrows, "Lấy danh sách đơn mượn theo tài sản thành công");
    }

    @PutMapping("/{id}/update-status")
    public ResponseEntity<ApiResponse<Void>> updateStatusAssetBorrow(@PathVariable Long id,
            @RequestParam AssetBorrowStatus status) {
        assetBorrowService.updateStatusAssetBorrow(id, status);
        return ResponseUtil.success(null, "Cập nhật trạng thái đơn mượn tài sản thành công");
    }

    @PutMapping("/{id}/return")
    @RequiresPermission("ASSET_BORROW_RETURN")
    public ResponseEntity<ApiResponse<Void>> returnAsset(@PathVariable Long id) {
        assetBorrowService.returnAsset(id);
        return ResponseUtil.success(null, "Trả tài sản thành công");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAssetBorrow(@PathVariable Long id) {
        assetBorrowService.deleteAssetBorrow(id);
        return ResponseUtil.success(null, "Xóa đơn mượn tài sản thành công");
    }
}
