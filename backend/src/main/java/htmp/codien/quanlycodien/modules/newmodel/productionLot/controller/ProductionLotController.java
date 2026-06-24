package htmp.codien.quanlycodien.modules.newmodel.productionLot.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.common.annotation.RequiresPermission;
import htmp.codien.quanlycodien.modules.newmodel.productionLot.dto.ProductionLotRequest;
import htmp.codien.quanlycodien.modules.newmodel.productionLot.dto.ProductionLotResponse;
import htmp.codien.quanlycodien.modules.newmodel.productionLot.service.ProductionLotService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/production-lots")
@RequiredArgsConstructor
public class ProductionLotController {

    private final ProductionLotService productionLotService;

    @PostMapping
    @RequiresPermission("NMD_PRODUCTION_LOT_CREATE")
    public ResponseEntity<ApiResponse<Void>> createProductionLot(
            @RequestBody ProductionLotRequest request) {
        productionLotService.createProductionLot(request);
        return ResponseUtil.success(null, "Tạo lot sản xuất thành công");
    }

    @PutMapping("/{id}")
    @RequiresPermission("NMD_PRODUCTION_LOT_UPDATE")
    public ResponseEntity<ApiResponse<Void>> updateProductionLot(
            @PathVariable Long id,
            @RequestBody ProductionLotRequest request) {
        productionLotService.updateProductionLot(id, request);
        return ResponseUtil.success(null, "Cập nhật lot sản xuất thành công");
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("NMD_PRODUCTION_LOT_DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteProductionLot(@PathVariable Long id) {
        productionLotService.deleteProductionLot(id);
        return ResponseUtil.success(null, "Xóa lot sản xuất thành công");
    }

    @GetMapping("/{id}")

    public ResponseEntity<ApiResponse<ProductionLotResponse>> getProductionLotById(@PathVariable Long id) {
        ProductionLotResponse response = productionLotService.getProductionLotById(id);
        return ResponseUtil.success(response, "Lấy thông tin lot sản xuất thành công");
    }

    @GetMapping

    public ResponseEntity<ApiResponse<List<ProductionLotResponse>>> getAllProductionLots() {
        List<ProductionLotResponse> response = productionLotService.getAllProductionLots();
        return ResponseUtil.success(response, "Lấy danh sách lot sản xuất thành công");
    }

    @GetMapping("/by-product-plan/{productPlanId}")
    public ResponseEntity<ApiResponse<List<ProductionLotResponse>>> getProductionLotsByProductPlan(
            @PathVariable Long productPlanId) {
        List<ProductionLotResponse> response = productionLotService.getProductionLotsByProductPlan(productPlanId);
        return ResponseUtil.success(response, "Lấy danh sách lot sản xuất theo kế hoạch sản phẩm thành công");
    }

    //

    //

    //

    //

    //

}