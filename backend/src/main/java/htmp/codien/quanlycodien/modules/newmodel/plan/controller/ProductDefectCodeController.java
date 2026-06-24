package htmp.codien.quanlycodien.modules.newmodel.plan.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productDefectCode.ProductDefectCodeDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.service.ProductDefectCodeService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/product-defect-codes")
@RequiredArgsConstructor
public class ProductDefectCodeController {

    private final ProductDefectCodeService productDefectCodeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDefectCodeDTO>>> getAll() {
        List<ProductDefectCodeDTO> defectCodes = productDefectCodeService.getAll();
        return ResponseUtil.success(defectCodes, "Lấy danh sách mã lỗi thành công");
    }
}
