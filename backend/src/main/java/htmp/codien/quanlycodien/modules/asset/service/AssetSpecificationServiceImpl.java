package htmp.codien.quanlycodien.modules.asset.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.modules.asset.dto.specification.AssetSpecificationRequest;
import htmp.codien.quanlycodien.modules.asset.dto.specification.AssetSpecificationResponse;
import htmp.codien.quanlycodien.modules.asset.entity.Asset;
import htmp.codien.quanlycodien.modules.asset.entity.AssetSpecification;
import htmp.codien.quanlycodien.modules.asset.repository.AssetSpecificationRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AssetSpecificationServiceImpl implements AssetSpecificationService {

    private final AssetSpecificationRepository assetSpecificationRepository;
    private final AssetService assetService;

    @Override
    @Transactional(readOnly = true)
    public AssetSpecificationResponse getAssetSpecificationByAssetId(Long assetId) {
        AssetSpecification specification = assetSpecificationRepository.findByAssetId(assetId)
                .orElseThrow(() -> new RuntimeException("Asset specification not found for asset id: " + assetId));
        return convertToResponse(specification);
    }

    @Override
    public void createAssetSpecification(Long assetId, AssetSpecificationRequest request) {
        Asset asset = assetService.findEntityById(assetId);

        if (assetSpecificationRepository.existsByAssetId(assetId)) {
            throw new RuntimeException("Asset specification already exists for asset id: " + assetId);
        }

        AssetSpecification specification = AssetSpecification.builder()
                .asset(asset)
                .ram(request.getRam())
                .rom(request.getRom())
                .cpu(request.getCpu())
                .manufacture(request.getManufacture())
                .dimension(request.getDimension())
                .weight(request.getWeight())
                .color(request.getColor())
                .material(request.getMaterial())
                .ipAddress(request.getIpAddress())
                .build();

        assetSpecificationRepository.save(specification);
    }

    @Override
    public void updateAssetSpecificationByAssetId(Long assetId, AssetSpecificationRequest request) {
        AssetSpecification specification = assetSpecificationRepository.findByAssetId(assetId)
                .orElseThrow(() -> new RuntimeException("Asset specification not found for asset id: " + assetId));

        specification.setRam(request.getRam());
        specification.setRom(request.getRom());
        specification.setCpu(request.getCpu());
        specification.setManufacture(request.getManufacture());
        specification.setDimension(request.getDimension());
        specification.setWeight(request.getWeight());
        specification.setColor(request.getColor());
        specification.setMaterial(request.getMaterial());
        specification.setIpAddress(request.getIpAddress());

        assetSpecificationRepository.save(specification);
    }

    @Override
    public void deleteAssetSpecificationByAssetId(Long assetId) {
        if (!assetSpecificationRepository.existsByAssetId(assetId)) {
            throw new RuntimeException("Asset specification not found for asset id: " + assetId);
        }
        assetSpecificationRepository.deleteByAssetId(assetId);
    }

    private AssetSpecificationResponse convertToResponse(AssetSpecification specification) {
        return AssetSpecificationResponse.builder()
                .id(specification.getId())
                .assetId(specification.getAsset() != null ? specification.getAsset().getId() : null)
                .assetName(specification.getAsset() != null ? specification.getAsset().getName() : null)
                .assetCode(specification.getAsset() != null ? specification.getAsset().getCode() : null)
                .ram(specification.getRam())
                .rom(specification.getRom())
                .cpu(specification.getCpu())
                .manufacture(specification.getManufacture())
                .dimension(specification.getDimension())
                .weight(specification.getWeight())
                .color(specification.getColor())
                .material(specification.getMaterial())
                .ipAddress(specification.getIpAddress())
                .build();
    }
}