package htmp.codien.quanlycodien.modules.newmodel.mapping.controller;

import java.util.List;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.suppliesHtmp.SuppliesHTMPDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.service.materialCategory.MaterialCategoryService;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductResinMappingDTO;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/supplies-htmp")
@RequiredArgsConstructor
@ConditionalOnBean(MaterialCategoryService.class)
public class SuppliesMappingController {
    private final MaterialCategoryService materialCategoryService;

    @GetMapping("/resins")
    public ResponseEntity<ApiResponse<List<ProductResinMappingDTO>>> getAllProductResinMapping(
            @RequestParam(required = false) String keyword) {
        List<ProductResinMappingDTO> results = materialCategoryService.getResin(keyword);
        return ResponseUtil.success(results, "Lấy danh sách Resin HTMP thành công");
    }

    @GetMapping("/supplies")
    public ResponseEntity<ApiResponse<List<SuppliesHTMPDTO>>> getAllSupplies(
            @RequestParam(required = false) String keyword) {
        List<SuppliesHTMPDTO> results = materialCategoryService.getSupplies(keyword);
        return ResponseUtil.success(results, "Lấy danh sách Supplies HTMP thành công");
    }

}
