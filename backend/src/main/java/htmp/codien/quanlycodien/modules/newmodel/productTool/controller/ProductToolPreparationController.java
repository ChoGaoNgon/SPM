package htmp.codien.quanlycodien.modules.newmodel.productTool.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ToolPreparationStatus;
import htmp.codien.quanlycodien.modules.newmodel.productTool.dto.ProductToolPreparationDTO;
import htmp.codien.quanlycodien.modules.newmodel.productTool.dto.ProductToolPreparationRequest;
import htmp.codien.quanlycodien.modules.newmodel.productTool.service.ProductToolPreparationService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products/tool-preparations")
@RequiredArgsConstructor
public class ProductToolPreparationController {

    private final ProductToolPreparationService toolPreparationService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductToolPreparationDTO>> createToolPreparation(
            @RequestBody ProductToolPreparationRequest request) {
        ProductToolPreparationDTO result = toolPreparationService.createToolPreparation(request);
        return ResponseUtil.success(result, "Tạo yêu cầu chuẩn bị dụng cụ thành công");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductToolPreparationDTO>> updateToolPreparation(
            @PathVariable Long id,
            @RequestBody ProductToolPreparationRequest request) {
        ProductToolPreparationDTO result = toolPreparationService.updateToolPreparation(id, request);
        return ResponseUtil.success(result, "Cập nhật yêu cầu chuẩn bị dụng cụ thành công");
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ProductToolPreparationDTO>>> getToolPreparationsByProduct(
            @PathVariable Long productId) {
        List<ProductToolPreparationDTO> result = toolPreparationService.getToolPreparationsByProduct(productId);
        return ResponseUtil.success(result, "Lấy danh sách yêu cầu chuẩn bị thành công");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductToolPreparationDTO>> getToolPreparationById(@PathVariable Long id) {
        ProductToolPreparationDTO result = toolPreparationService.getToolPreparationById(id);
        return ResponseUtil.success(result, "Lấy thông tin yêu cầu chuẩn bị thành công");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteToolPreparation(@PathVariable Long id) {
        toolPreparationService.deleteToolPreparation(id);
        return ResponseUtil.success(null, "Xóa yêu cầu chuẩn bị dụng cụ thành công");
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long id,
            @RequestParam ToolPreparationStatus status) {
        toolPreparationService.updateStatus(id, status);
        return ResponseUtil.success(null, "Cập nhật trạng thái thành công");
    }

    @GetMapping("/product/{productId}/ready-status")
    public ResponseEntity<ApiResponse<Boolean>> checkAllToolsReady(@PathVariable Long productId) {
        boolean ready = toolPreparationService.areAllToolsReady(productId);
        return ResponseUtil.success(ready, ready ? "Tất cả dụng cụ đã sẵn sàng" : "Còn dụng cụ chưa hoàn thành");
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<ProductToolPreparationDTO>>> getToolPreparationsByEmployee(
            @PathVariable Long employeeId) {
        List<ProductToolPreparationDTO> result = toolPreparationService.getToolPreparationsByEmployee(employeeId);
        return ResponseUtil.success(result, "Lấy danh sách yêu cầu chuẩn bị theo nhân viên thành công");
    }
}
