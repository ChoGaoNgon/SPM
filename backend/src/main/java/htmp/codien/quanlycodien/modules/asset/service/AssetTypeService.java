package htmp.codien.quanlycodien.modules.asset.service;

import htmp.codien.quanlycodien.modules.asset.dto.type.AssetTypeRequest;
import htmp.codien.quanlycodien.modules.asset.dto.type.AssetTypeResponse;
import htmp.codien.quanlycodien.modules.asset.entity.AssetType;

import java.util.List;

public interface AssetTypeService {
    List<AssetTypeResponse> getAllAssetTypes();

    AssetTypeResponse getAssetTypeById(Long id);

    void createAssetType(AssetTypeRequest request);

    void updateAssetType(Long id, AssetTypeRequest request);

    void deleteAssetType(Long id);

    AssetType findEntityById(Long id);
}