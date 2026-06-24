package htmp.codien.quanlycodien.modules.asset.controller;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.asset.dto.specification.AssetSpecificationRequest;
import htmp.codien.quanlycodien.modules.asset.dto.specification.AssetSpecificationResponse;
import htmp.codien.quanlycodien.modules.asset.service.AssetSpecificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/asset-specifications")
@RequiredArgsConstructor
public class AssetSpecificationController {

    private final AssetSpecificationService assetSpecificationService;

    @GetMapping("/asset/{assetId}")
    public ResponseEntity<ApiResponse<AssetSpecificationResponse>> getAssetSpecificationByAssetId(
            @PathVariable Long assetId) {
        AssetSpecificationResponse specification = assetSpecificationService.getAssetSpecificationByAssetId(assetId);
        return ResponseUtil.success(specification, "Lấy thông số kỹ thuật theo asset thành công");
    }

    @PostMapping("/asset/{assetId}")
    public ResponseEntity<ApiResponse<Void>> createAssetSpecification(@PathVariable Long assetId,
            @RequestBody AssetSpecificationRequest request) {
        assetSpecificationService.createAssetSpecification(assetId, request);
        return ResponseUtil.success(null, "Tạo thông số kỹ thuật thành công");
    }

    @PutMapping("/asset/{assetId}")
    public ResponseEntity<ApiResponse<Void>> updateAssetSpecificationByAssetId(@PathVariable Long assetId,
            @RequestBody AssetSpecificationRequest request) {
        assetSpecificationService.updateAssetSpecificationByAssetId(assetId, request);
        return ResponseUtil.success(null, "Cập nhật thông số kỹ thuật thành công");
    }

    @DeleteMapping("/asset/{assetId}")
    public ResponseEntity<ApiResponse<Void>> deleteAssetSpecificationByAssetId(@PathVariable Long assetId) {
        assetSpecificationService.deleteAssetSpecificationByAssetId(assetId);
        return ResponseUtil.success(null, "Xóa thông số kỹ thuật theo asset thành công");
    }
}