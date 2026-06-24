package htmp.codien.quanlycodien.modules.asset.controller;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.asset.dto.assignment.AssetAssignmentCreationRequest;
import htmp.codien.quanlycodien.modules.asset.dto.assignment.AssetAssignmentResponse;
import htmp.codien.quanlycodien.modules.asset.dto.assignment.AssetAssignmentUpdationRequest;
import htmp.codien.quanlycodien.modules.asset.service.AssetAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/asset-assignments")
@RequiredArgsConstructor
public class AssetAssignmentController {

    private final AssetAssignmentService assetAssignmentService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssetAssignmentResponse>> getAssetAssignmentById(@PathVariable Long id) {
        AssetAssignmentResponse assignment = assetAssignmentService.getAssetAssignmentById(id);
        return ResponseUtil.success(assignment, "Lấy phân công tài sản thành công");
    }

    @GetMapping("/asset/{assetId}")
    public ResponseEntity<ApiResponse<List<AssetAssignmentResponse>>> getAssetAssignmentsByAssetId(
            @PathVariable Long assetId) {
        List<AssetAssignmentResponse> assignments = assetAssignmentService.getAssetAssignmentsByAssetId(assetId);
        return ResponseUtil.success(assignments, "Lấy danh sách phân công tài sản theo tài sản thành công");
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<AssetAssignmentResponse>>> getAssetAssignmentsByEmployeeId(
            @PathVariable Long employeeId) {
        List<AssetAssignmentResponse> assignments = assetAssignmentService.getAssetAssignmentsByEmployeeId(employeeId);
        return ResponseUtil.success(assignments, "Lấy danh sách phân công tài sản theo nhân viên thành công");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createAssetAssignment(
            @RequestBody AssetAssignmentCreationRequest request) {
        assetAssignmentService.createAssetAssignment(request);
        return ResponseUtil.success(null, "Tạo phân công tài sản thành công");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updateAssetAssignment(@PathVariable Long id,
            @RequestBody AssetAssignmentUpdationRequest request) {
        assetAssignmentService.updateAssetAssignment(id, request);
        return ResponseUtil.success(null, "Cập nhật phân công tài sản thành công");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAssetAssignment(@PathVariable Long id) {
        assetAssignmentService.deleteAssetAssignment(id);
        return ResponseUtil.success(null, "Xóa phân công tài sản thành công");
    }
}