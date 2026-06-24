package htmp.codien.quanlycodien.modules.asset.controller;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.asset.dto.type.AssetTypeRequest;
import htmp.codien.quanlycodien.modules.asset.dto.type.AssetTypeResponse;
import htmp.codien.quanlycodien.modules.asset.service.AssetTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/asset-types")
@RequiredArgsConstructor
public class AssetTypeController {

    private final AssetTypeService assetTypeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssetTypeResponse>>> getAllAssetTypes() {
        List<AssetTypeResponse> assetTypes = assetTypeService.getAllAssetTypes();
        return ResponseUtil.success(assetTypes, "Lấy danh sách loại tài sản thành công");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssetTypeResponse>> getAssetTypeById(@PathVariable Long id) {
        AssetTypeResponse assetType = assetTypeService.getAssetTypeById(id);
        return ResponseUtil.success(assetType, "Lấy loại tài sản thành công");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createAssetType(@RequestBody AssetTypeRequest request) {
        assetTypeService.createAssetType(request);
        return ResponseUtil.success(null, "Tạo loại tài sản thành công");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updateAssetType(@PathVariable Long id,
            @RequestBody AssetTypeRequest request) {
        assetTypeService.updateAssetType(id, request);
        return ResponseUtil.success(null, "Cập nhật loại tài sản thành công");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssetType(@PathVariable Long id) {
        assetTypeService.deleteAssetType(id);
        return ResponseEntity.noContent().build();
    }
}