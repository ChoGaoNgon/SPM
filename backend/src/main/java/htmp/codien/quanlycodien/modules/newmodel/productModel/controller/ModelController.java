package htmp.codien.quanlycodien.modules.newmodel.productModel.controller;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.common.annotation.RequiresPermission;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.sendMail.SendModelMailRequest;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductDTO;
import htmp.codien.quanlycodien.modules.newmodel.productModel.dto.ModelRequest;
import htmp.codien.quanlycodien.modules.newmodel.productModel.dto.ModelResponse;
import htmp.codien.quanlycodien.modules.newmodel.productModel.service.ModelService;
import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.util.List;

import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/models")
@RequiredArgsConstructor
public class ModelController {

    private final ModelService modelService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ModelResponse>> getModelById(@PathVariable Long id) {
        ModelResponse result = modelService.getModelById(id);
        return ResponseUtil.success(result, "Lấy thông tin model thành công");
    }

    @GetMapping("/{id}/products")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getAllProductByModel(@PathVariable Long id) {
        List<ProductDTO> products = modelService.getAllProductByModel(id);
        return ResponseUtil.success(products, "Lấy danh sách sản phẩm theo model thành công");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ModelResponse>>> getAllModels(Pageable pageable) {
        Page<ModelResponse> models = modelService.getAllModels(pageable);
        return ResponseUtil.success(models, "Lấy danh sách model thành công");
    }

    @GetMapping("/search-models")
    public ResponseEntity<ApiResponse<Page<ModelResponse>>> searchModels(
            Pageable pageable,
            @RequestParam(required = false) String keyword) {

        Page<ModelResponse> result = modelService.searchModels(pageable, keyword);
        return ResponseUtil.success(result, "Tìm kiếm model thành công");
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ModelResponse>>> searchByProductCodeOrMoldCode(
            Pageable pageable,
            @RequestParam("keyword") String keyword) {

        Page<ModelResponse> result = modelService.searchByProductCodeOrMoldCode(pageable, keyword);
        return ResponseUtil.success(result, "Tìm kiếm model theo mã sản phẩm hoặc khuôn thành công");
    }

    @PostMapping
    @RequiresPermission("NMD_MODEL_CREATE")
    public ResponseEntity<ApiResponse<Void>> createModel(@RequestBody ModelRequest modelRequest) {
        modelService.createModel(modelRequest);
        return ResponseUtil.success(null, "Tạo mới model thành công");
    }

    @PostMapping("/approve-and-send-mail")
    @RequiresPermission("NMD_MODEL_SEND_MAIL")
    public ResponseEntity<ApiResponse<Void>> approveAndSendMail(@RequestBody SendModelMailRequest request) {
        modelService.approveAndSendMail(request);
        return ResponseUtil.success(null, "Gửi mail thành công");
    }

    @PutMapping("/{id}")
    @RequiresPermission("NMD_MODEL_UPDATE")
    public ResponseEntity<ApiResponse<Void>> updateModel(
            @PathVariable Long id,
            @RequestBody ModelRequest modelRequest) {
        modelService.updateModel(id, modelRequest);
        return ResponseUtil.success(null, "Cập nhật model thành công");
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("NMD_MODEL_DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteModel(@PathVariable Long id) {
        modelService.deleteModel(id);
        return ResponseUtil.success(null, "Xóa model thành công");
    }

    @PostMapping("/import-from-excel")
    @RequiresPermission("NMD_MODEL_CREATE")
    public ResponseEntity<ApiResponse<Void>> importModelsFromExcel(
            @RequestPart("file") MultipartFile file) {
        modelService.importModelsFromExcel(file);
        return ResponseUtil.success(null, "Import model và sản phẩm từ Excel thành công");
    }

    @GetMapping("/template")
    public ResponseEntity<ClassPathResource> downloadTemplate() throws IOException {
        ClassPathResource resource = new ClassPathResource("templates/PBI_IT - Form nhập sản phẩm mới.xlsx");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=new-model-template.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

}
