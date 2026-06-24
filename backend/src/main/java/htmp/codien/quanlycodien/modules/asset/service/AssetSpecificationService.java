package htmp.codien.quanlycodien.modules.asset.service;

import htmp.codien.quanlycodien.modules.asset.dto.specification.AssetSpecificationRequest;
import htmp.codien.quanlycodien.modules.asset.dto.specification.AssetSpecificationResponse;

public interface AssetSpecificationService {

    AssetSpecificationResponse getAssetSpecificationByAssetId(Long assetId);

    void createAssetSpecification(Long assetId, AssetSpecificationRequest request);

    void updateAssetSpecificationByAssetId(Long assetId, AssetSpecificationRequest request);

    void deleteAssetSpecificationByAssetId(Long assetId);
}