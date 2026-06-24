package htmp.codien.quanlycodien.modules.asset.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
import htmp.codien.quanlycodien.modules.asset.dto.asset.AssetDetailResponse;
import htmp.codien.quanlycodien.modules.asset.dto.asset.AssetRequest;
import htmp.codien.quanlycodien.modules.asset.dto.asset.AssetResponse;
import htmp.codien.quanlycodien.modules.asset.dto.asset.AssetStatisticalResponse;
import htmp.codien.quanlycodien.modules.asset.enums.AssetAssignmentStatus;
import htmp.codien.quanlycodien.modules.asset.service.AssetService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createAsset(@RequestBody AssetRequest request) {
        assetService.createAsset(request);
        return ResponseUtil.success(null, "Tạo tài sản thành công");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updateAsset(@PathVariable Long id,
            @RequestBody AssetRequest request) {
        assetService.updateAsset(id, request);
        return ResponseUtil.success(null, "Cập nhật tài sản thành công");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AssetResponse>>> getAllAssetsWithKeyword(Pageable pageable,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long assetTypeId,
            @RequestParam(required = false) Long employeeUseId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) AssetAssignmentStatus status,
            @RequestParam(required = false) Boolean isAvailable) {
        {
            Page<AssetResponse> assets = assetService.getAllAssetsWithKeyword(pageable, assetTypeId, keyword,
                    employeeUseId, departmentId, status, isAvailable);
            return ResponseUtil.success(assets, "Lấy danh sách tài sản thành công");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssetDetailResponse>> getAssetById(@PathVariable Long id) {
        AssetDetailResponse asset = assetService.getAssetById(id);
        return ResponseUtil.success(asset, "Lấy tài sản thành công");
    }

    @GetMapping("/{id}/with-specification")
    public ResponseEntity<ApiResponse<AssetResponse>> getAssetByIdWithSpecification(@PathVariable Long id) {
        AssetResponse asset = assetService.getAssetByIdWithSpecification(id);
        return ResponseUtil.success(asset, "Lấy tài sản với thông số kỹ thuật thành công");
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<AssetResponse>>> searchAsset(
            @RequestParam(required = false) String keyword) {
        List<AssetResponse> assets = assetService.searchAsset(keyword);
        return ResponseUtil.success(assets, "Tìm kiếm tài sản thành công");
    }

    @GetMapping("/asset-type/{assetTypeId}")
    public ResponseEntity<ApiResponse<List<AssetResponse>>> getAssetsByAssetTypeId(@PathVariable Long assetTypeId) {
        List<AssetResponse> assets = assetService.getAssetsByAssetTypeId(assetTypeId);
        return ResponseUtil.success(assets, "Lấy danh sách tài sản theo loại tài sản thành công");
    }

    @GetMapping("/stat")
    public ResponseEntity<ApiResponse<AssetStatisticalResponse>> getAssetStatistical() {
        AssetStatisticalResponse assets = assetService.getAssetStatistical();
        return ResponseUtil.success(assets, "Lấy danh sách tài sản theo loại tài sản thành công");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseUtil.success(null, "Xóa tài sản thành công");
    }
}