package htmp.codien.quanlycodien.modules.asset.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.modules.asset.dto.asset.AssetDetailResponse;
import htmp.codien.quanlycodien.modules.asset.dto.asset.AssetRequest;
import htmp.codien.quanlycodien.modules.asset.dto.asset.AssetResponse;
import htmp.codien.quanlycodien.modules.asset.dto.asset.AssetStatisticalResponse;
import htmp.codien.quanlycodien.modules.asset.dto.assignment.AssetAssignmentResponse;
import htmp.codien.quanlycodien.modules.asset.dto.specification.AssetSpecificationResponse;
import htmp.codien.quanlycodien.modules.asset.dto.type.AssetTypeResponse;
import htmp.codien.quanlycodien.modules.asset.entity.Asset;
import htmp.codien.quanlycodien.modules.asset.entity.AssetSpecification;
import htmp.codien.quanlycodien.modules.asset.entity.AssetType;
import htmp.codien.quanlycodien.modules.asset.enums.AssetAssignmentStatus;
import htmp.codien.quanlycodien.modules.asset.repository.AssetRepository;
import htmp.codien.quanlycodien.modules.asset.specification.AssetManagementSpecification;
import htmp.codien.quanlycodien.modules.department.entity.Department;
import htmp.codien.quanlycodien.modules.department.service.DepartmentService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AssetServiceImpl implements AssetService {

        private final AssetRepository assetRepository;
        private final AssetTypeService assetTypeService;
        private final DepartmentService departmentService;

        @Override
        public void createAsset(AssetRequest request) {

                if (assetRepository.existsByCode(request.getCode())) {
                        throw new RuntimeException("Tài sản với mã '" + request.getCode() + "' đã tồn tại");
                }

                AssetType assetType = assetTypeService.findEntityById(request.getAssetTypeId());
                Department department = departmentService.getDepartmentById(request.getDepartmentId());

                Asset asset = Asset.builder()
                                .name(request.getName())
                                .code(request.getCode())
                                .position(request.getPosition())
                                .purchaseDate(request.getPurchaseDate())
                                .description(request.getDescription())
                                .assetType(assetType)
                                .department(department)
                                .model(request.getModel())
                                .build();
                assetRepository.save(asset);

        }

        @Override
        public void updateAsset(Long id, AssetRequest request) {

                Asset asset = findEntityById(id);

                if (!asset.getCode().equals(request.getCode()) &&
                                assetRepository.existsByCode(request.getCode())) {
                        throw new RuntimeException("Tài sản với mã '" + request.getCode() + "' đã tồn tại");
                }

                if (asset.getStatus() == AssetAssignmentStatus.IN_USE) {
                        throw new RuntimeException("Không thể cập nhật trạng thái vì tài sản đang được sử dụng");
                }

                AssetType assetType = assetTypeService.findEntityById(request.getAssetTypeId());
                asset.setStatus(request.getStatus());
                asset.setName(request.getName());
                asset.setPosition(request.getPosition());
                asset.setAssetType(assetType);
                asset.setCode(request.getCode());
                asset.setDescription(request.getDescription());
                asset.setPurchaseDate(request.getPurchaseDate());
                asset.setModel(request.getModel());
                assetRepository.save(asset);

        }

        @Override
        @Transactional(readOnly = true)
        public Page<AssetResponse> getAllAssetsWithKeyword(
                        Pageable pageable,
                        Long assetTypeId,
                        String keyword,
                        Long employeeUseId,
                        Long departmentId,
                        AssetAssignmentStatus status,
                        Boolean isAvailable) {

                if (employeeUseId != null && departmentId != null) {
                        throw new IllegalArgumentException(
                                        "Không thể tìm kiếm theo cả nhân viên đang sử dụng và phòng ban quản lý thiết bị cùng lúc");
                }

                Specification<Asset> specification = null;

                if (keyword != null && !keyword.trim().isEmpty()) {
                        specification = AssetManagementSpecification.hasKeyword(keyword);
                }

                if (assetTypeId != null) {
                        specification = specification == null
                                        ? AssetManagementSpecification.hasAssetTypeId(assetTypeId)
                                        : specification.and(AssetManagementSpecification.hasAssetTypeId(assetTypeId));
                }

                if (employeeUseId != null) {
                        specification = specification == null
                                        ? AssetManagementSpecification.hasEmployeeUseId(employeeUseId)
                                        : specification.and(
                                                        AssetManagementSpecification.hasEmployeeUseId(employeeUseId));
                }

                if (departmentId != null) {
                        specification = specification == null
                                        ? AssetManagementSpecification.hasDepartmentId(departmentId)
                                        : specification.and(AssetManagementSpecification.hasDepartmentId(departmentId));
                }

                if (status != null) {
                        specification = specification == null
                                        ? AssetManagementSpecification.hasStatus(status)
                                        : specification.and(AssetManagementSpecification.hasStatus(status));
                }

                if (isAvailable != null && isAvailable) {
                        specification = specification == null
                                        ? AssetManagementSpecification.hasStatus(AssetAssignmentStatus.AVAILABLE)
                                        : specification.and(AssetManagementSpecification
                                                        .hasStatus(AssetAssignmentStatus.AVAILABLE));
                }

                Page<Asset> assetPage = assetRepository.findAll(specification, pageable);
                return assetPage.map(this::convertToResponse);
        }

        @Override
        @Transactional(readOnly = true)
        public AssetDetailResponse getAssetById(Long id) {
                Asset asset = assetRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Tài sản không tồn tại với id: " + id));
                return convertToDetailResponse(asset);
        }

        @Override
        @Transactional(readOnly = true)
        public AssetResponse getAssetByIdWithSpecification(Long id) {
                Asset asset = assetRepository.findByIdWithSpecification(id)
                                .orElseThrow(() -> new RuntimeException("Asset not found with id: " + id));
                return convertToResponse(asset);
        }

        @Override
        public void deleteAsset(Long id) {

                Asset asset = findEntityById(id);

                assetRepository.delete(asset);

        }

        @Override
        @Transactional(readOnly = true)
        public List<AssetResponse> getAssetsByAssetTypeId(Long assetTypeId) {
                return assetRepository.findByAssetTypeId(assetTypeId).stream()
                                .map(this::convertToResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public List<AssetResponse> getAssetsByEmployeetId(Long employeeId) {

                return assetRepository.findAll().stream()
                                .filter(asset -> asset.getAssetAssignments().stream()
                                                .anyMatch(assignment -> assignment.getEmployeeUse() != null &&
                                                                assignment.getEmployeeUse().getId().equals(employeeId)))
                                .map(this::convertToResponse)
                                .collect(Collectors.toList());

        }

        @Override
        @Transactional(readOnly = true)
        public Asset findEntityById(Long id) {
                return assetRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Asset not found with id: " + id));
        }

        private AssetResponse convertToResponse(Asset asset) {
                return AssetResponse.builder()
                                .id(asset.getId())
                                .name(asset.getName())
                                .purchaseDate(asset.getPurchaseDate())
                                .position(asset.getPosition())
                                .code(asset.getCode())
                                .description(asset.getDescription())
                                .status(asset.getStatus())
                                .model(asset.getModel())
                                .assetTypeId(
                                                asset.getAssetType() != null
                                                                ? asset.getAssetType().getId()
                                                                : null)
                                .assetTypeName(
                                                asset.getAssetType() != null
                                                                ? asset.getAssetType().getName()
                                                                : null)
                                .departmentId(
                                                asset.getDepartment() != null
                                                                ? asset.getDepartment().getId()
                                                                : null)
                                .departmentName(
                                                asset.getDepartment() != null
                                                                ? asset.getDepartment().getName()
                                                                : null)
                                .build();
        }

        private AssetDetailResponse convertToDetailResponse(Asset asset) {
                return AssetDetailResponse.builder()
                                .id(asset.getId())
                                .purchaseDate(asset.getPurchaseDate())
                                .position(asset.getPosition())
                                .name(asset.getName())
                                .code(asset.getCode())
                                .description(asset.getDescription())
                                .status(asset.getStatus())
                                .model(asset.getModel())
                                .assetType(
                                                asset.getAssetType() != null
                                                                ? convertToSpecificationResponse(asset.getAssetType())
                                                                : null)
                                .assetTypeName(
                                                asset.getAssetType() != null
                                                                ? asset.getAssetType().getName()
                                                                : null)
                                .departmentId(
                                                asset.getDepartment() != null
                                                                ? asset.getDepartment().getId()
                                                                : null)
                                .departmentName(
                                                asset.getDepartment() != null
                                                                ? asset.getDepartment().getName()
                                                                : null)
                                .specification(
                                                asset.getAssetSpecification() != null
                                                                ? convertToSpecificationResponse(
                                                                                asset.getAssetSpecification())
                                                                : null)
                                .assignment(
                                                asset.getAssetAssignments() != null
                                                                ? convertToAssignmentResponse(
                                                                                asset.getAssetAssignments())
                                                                : null)
                                .build();
        }

        private AssetSpecificationResponse convertToSpecificationResponse(AssetSpecification specification) {
                return AssetSpecificationResponse.builder()
                                .id(specification.getId())
                                .assetId(
                                                specification.getAsset() != null
                                                                ? specification.getAsset().getId()
                                                                : null)
                                .assetName(
                                                specification.getAsset() != null
                                                                ? specification.getAsset().getName()
                                                                : null)
                                .assetCode(
                                                specification.getAsset() != null
                                                                ? specification.getAsset().getCode()
                                                                : null)
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

        private AssetTypeResponse convertToSpecificationResponse(AssetType assetType) {
                return AssetTypeResponse.builder()
                                .id(assetType.getId())
                                .name(assetType.getName())
                                .description(assetType.getDescription())
                                .build();
        }

        private AssetAssignmentResponse convertToAssignmentResponse(
                        List<htmp.codien.quanlycodien.modules.asset.entity.AssetAssignment> assignments) {

                for (htmp.codien.quanlycodien.modules.asset.entity.AssetAssignment assignment : assignments) {
                        if (assignment.getReturnAt() == null) {
                                return AssetAssignmentResponse.builder()
                                                .id(assignment.getId())
                                                .employeeUseId(assignment.getEmployeeUse() != null
                                                                ? assignment.getEmployeeUse().getId()
                                                                : null)
                                                .employeeUseName(
                                                                assignment.getEmployeeUse() != null
                                                                                ? assignment.getEmployeeUse().getName()
                                                                                : null)
                                                .departmentUseId(
                                                                assignment.getDepartmentUse() != null
                                                                                ? assignment.getDepartmentUse().getId()
                                                                                : null)
                                                .departmentUseName(
                                                                assignment.getDepartmentUse() != null
                                                                                ? assignment.getDepartmentUse()
                                                                                                .getName()
                                                                                : null)
                                                .assetId(assignment.getAsset() != null ? assignment.getAsset().getId()
                                                                : null)
                                                .assignAt(assignment.getAssignAt())
                                                .returnAt(assignment.getReturnAt())
                                                .build();
                        }
                }
                return null;
        }

        @Override
        public List<AssetResponse> searchAsset(String keyword) {
                Specification<Asset> spec = AssetManagementSpecification.hasKeyword(keyword);

                return assetRepository.findAll(spec).stream()
                                .map(this::convertToResponse)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional(readOnly = true)
        public AssetStatisticalResponse getAssetStatistical() {
                List<Asset> allAssets = assetRepository.findAll();

                int totalAssets = allAssets.size();

                int totalAvailable = (int) allAssets.stream()
                                .filter(asset -> asset.getStatus() == AssetAssignmentStatus.AVAILABLE)
                                .count();

                int totalInUse = (int) allAssets.stream()
                                .filter(asset -> asset.getStatus() == AssetAssignmentStatus.IN_USE)
                                .count();

                int totalMaintenance = (int) allAssets.stream()
                                .filter(asset -> asset.getStatus() == AssetAssignmentStatus.MAINTENANCE)
                                .count();

                int totalBroken = (int) allAssets.stream()
                                .filter(asset -> asset.getStatus() == AssetAssignmentStatus.BROKEN)
                                .count();

                int totalLost = (int) allAssets.stream()
                                .filter(asset -> asset.getStatus() == AssetAssignmentStatus.LOST)
                                .count();

                return AssetStatisticalResponse.builder()
                                .totalAssets(totalAssets)
                                .totalAvailableAssets(totalAvailable)
                                .totalAssignedAssets(totalInUse)
                                .totalMaintenanceAssets(totalMaintenance)
                                .totalBrokenAssets(totalBroken)
                                .totalLostAssets(totalLost)
                                .build();
        }

}