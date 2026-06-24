package htmp.codien.quanlycodien.modules.asset.service;

import java.util.List;

import htmp.codien.quanlycodien.modules.asset.dto.assignment.AssetAssignmentCreationRequest;
import htmp.codien.quanlycodien.modules.asset.dto.assignment.AssetAssignmentResponse;
import htmp.codien.quanlycodien.modules.asset.dto.assignment.AssetAssignmentUpdationRequest;

public interface AssetAssignmentService {

    AssetAssignmentResponse getAssetAssignmentById(Long id);

    void createAssetAssignment(AssetAssignmentCreationRequest request);

    void updateAssetAssignment(Long id, AssetAssignmentUpdationRequest request);

    void deleteAssetAssignment(Long id);

    List<AssetAssignmentResponse> getAssetAssignmentsByAssetId(Long assetId);

    List<AssetAssignmentResponse> getAssetAssignmentsByEmployeeId(Long employeeId);
}