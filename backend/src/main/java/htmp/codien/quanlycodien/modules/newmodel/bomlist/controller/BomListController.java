package htmp.codien.quanlycodien.modules.newmodel.bomlist.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.common.annotation.RequiresPermission;
import htmp.codien.quanlycodien.modules.newmodel.bomlist.dto.BomListApprovalRequest;
import htmp.codien.quanlycodien.modules.newmodel.bomlist.dto.BomListRequest;
import htmp.codien.quanlycodien.modules.newmodel.bomlist.dto.BomListResponse;
import htmp.codien.quanlycodien.modules.newmodel.bomlist.service.BomListService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bomlists")
@RequiredArgsConstructor
public class BomListController {
    private final BomListService bomListService;

    @PostMapping
    @RequiresPermission("NMD_BOMLIST_CREATE")
    public ResponseEntity<ApiResponse<Void>> createBomlist(
            @RequestParam Long modelId,
            @RequestPart("data") BomListRequest req,
            @RequestPart(value = "uploadFile", required = false) MultipartFile uploadFile) {
        bomListService.createBomlist(modelId, req, uploadFile);
        return ResponseUtil.success(null, "Tạo bomlist thành công");
    }

    @PutMapping("{id}")
    @RequiresPermission("NMD_BOMLIST_UPDATE")
    public ResponseEntity<ApiResponse<Void>> updateBomlist(
            @PathVariable Long id,
            @RequestPart("data") BomListRequest req,
            @RequestPart(value = "uploadFile", required = false) MultipartFile uploadFile) {
        bomListService.updateBomlist(id, req, uploadFile);
        return ResponseUtil.success(null, "Chỉnh sửa bomlist thành công");
    }

    @PatchMapping("{id}/approve")
    @RequiresPermission("NMD_BOMLIST_APPROVE")
    public ResponseEntity<ApiResponse<Void>> approveBomlist(
            @PathVariable Long id,
            @RequestBody BomListApprovalRequest req) {
        bomListService.approvalBomlist(id, req);
        if (req.getIsApprove()) {
            return ResponseUtil.success(null, "Phê duyệt bomlist thành công");

        } else {
            return ResponseUtil.success(null, "Từ chối phê duyệt bomlist thành công");
        }
    }

    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<BomListResponse>> getBomListById(
            @PathVariable Long id) {
        BomListResponse res = bomListService.getBomListById(id);
        return ResponseUtil.success(res, "Lấy bom list với id: " + id + "thành công");
    }

    @GetMapping("by-models")
    public ResponseEntity<ApiResponse<List<BomListResponse>>> getAllBomListByModelId(
            @RequestParam Long modelId) {
        List<BomListResponse> res = bomListService.getBomListByModelId(modelId);
        return ResponseUtil.success(res, "Lấy danh sách bomlist của model: " + modelId + " thành công");
    }

    @DeleteMapping("{id}")
    @RequiresPermission("NMD_BOMLIST_DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteBomlist(
            @PathVariable Long id) {
        bomListService.deleteBomlist(id);
        return ResponseUtil.success(null, "Xóa bomlist thành công");
    }

}
