package htmp.codien.quanlycodien.modules.newmodel.mapping.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.newmodel.mapping.service.ProductCodeMappingService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/product-code-mappings")
@RequiredArgsConstructor
public class ProductCodeMappingController {

    private final ProductCodeMappingService productCodeMappingService;

    @PostMapping("/import")
    public ResponseEntity<ApiResponse<Void>> importProductCodeMapping(@RequestParam("file") MultipartFile file) {
        int importedCount = productCodeMappingService.importFromExcel(file);
        return ResponseUtil.success(null, "Import mapping mã sản phẩm thành công: " + importedCount + " dòng");
    }
}