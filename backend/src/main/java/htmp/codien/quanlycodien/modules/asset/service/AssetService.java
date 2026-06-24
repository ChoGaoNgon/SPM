package htmp.codien.quanlycodien.modules.asset.service;

import htmp.codien.quanlycodien.modules.asset.dto.asset.AssetDetailResponse;
import htmp.codien.quanlycodien.modules.asset.dto.asset.AssetRequest;
import htmp.codien.quanlycodien.modules.asset.dto.asset.AssetResponse;
import htmp.codien.quanlycodien.modules.asset.dto.asset.AssetStatisticalResponse;
import htmp.codien.quanlycodien.modules.asset.entity.Asset;
import htmp.codien.quanlycodien.modules.asset.enums.AssetAssignmentStatus;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AssetService {
    Page<AssetResponse> getAllAssetsWithKeyword(Pageable pageable, Long assetTypeId, String keyword, Long employeeUseId,
            Long departmentId, AssetAssignmentStatus status, Boolean isAvailable);

    AssetDetailResponse getAssetById(Long id);

    AssetResponse getAssetByIdWithSpecification(Long id);

    void createAsset(AssetRequest request);

    void updateAsset(Long id, AssetRequest request);

    void deleteAsset(Long id);

    List<AssetResponse> getAssetsByAssetTypeId(Long assetTypeId);

    Asset findEntityById(Long id);

    List<AssetResponse> searchAsset(String keyword);

    List<AssetResponse> getAssetsByEmployeetId(Long employeeId);

    AssetStatisticalResponse getAssetStatistical();

}
