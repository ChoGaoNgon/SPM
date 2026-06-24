package htmp.codien.quanlycodien.modules.asset.service;

import htmp.codien.quanlycodien.modules.asset.dto.type.AssetTypeRequest;
import htmp.codien.quanlycodien.modules.asset.dto.type.AssetTypeResponse;
import htmp.codien.quanlycodien.modules.asset.entity.AssetType;
import htmp.codien.quanlycodien.modules.asset.repository.AssetTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetTypeServiceImpl implements AssetTypeService {

    private final AssetTypeRepository assetTypeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AssetTypeResponse> getAllAssetTypes() {
        return assetTypeRepository.getAssetTypeQuantities();
    }

    @Override
    @Transactional(readOnly = true)
    public AssetTypeResponse getAssetTypeById(Long id) {
        AssetType assetType = findEntityById(id);
        return convertToResponse(assetType);
    }

    @Override
    public void createAssetType(AssetTypeRequest request) {

        if (assetTypeRepository.existsByName(request.getName())) {
            throw new RuntimeException("Tài sản với tên'" + request.getName() + "' đã tồn tại");
        }

        AssetType assetType = AssetType.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        assetTypeRepository.save(assetType);
    }

    @Override
    public void updateAssetType(Long id, AssetTypeRequest request) {

        AssetType assetType = findEntityById(id);

        if (!assetType.getName().equals(request.getName()) &&
                assetTypeRepository.existsByName(request.getName())) {
            throw new RuntimeException("Loại thiết bị với tên '" + request.getName() + "' đã tồn tại");
        }

        assetType.setName(request.getName());
        assetType.setDescription(request.getDescription());
        assetTypeRepository.save(assetType);
    }

    @Override
    public void deleteAssetType(Long id) {
        AssetType assetType = findEntityById(id);
        assetTypeRepository.delete(assetType);

    }

    @Override
    @Transactional(readOnly = true)
    public AssetType findEntityById(Long id) {
        return assetTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset type not found with id: " + id));
    }

    private AssetTypeResponse convertToResponse(AssetType assetType) {
        return AssetTypeResponse.builder()
                .id(assetType.getId())
                .name(assetType.getName())
                .description(assetType.getDescription())
                .build();
    }
}