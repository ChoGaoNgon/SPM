package htmp.codien.quanlycodien.modules.newmodel.product.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.common.annotation.RequiresPermission;
import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.common.exception.ForbiddenException;
import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.ProductCategoryOptionDTO;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductCreationRequest;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductDetailResponse;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductHistoryResponse;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductNmdInfoUpdateRequest;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductProgressResponse;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductQuickCreationRequest;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductShortResponse;
import htmp.codien.quanlycodien.modules.newmodel.product.service.ProductHistoryService;
import htmp.codien.quanlycodien.modules.newmodel.product.service.ProductService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductHistoryService productHistoryService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RequiresPermission("NMD_PRODUCT_CREATE")
    public ResponseEntity<ApiResponse<Void>> createProduct(
            @RequestParam Long modelId,
            @RequestPart("data") ProductCreationRequest request,
            @RequestPart(value = "uploadFiles", required = false) List<MultipartFile> uploadFiles,
            @RequestPart(value = "keptOldFiles", required = false) String keptOldFilesJson,
            @RequestPart(value = "deletedOldFiles", required = false) String deletedOldFilesJson) {

        productService.createProducts(modelId, request, uploadFiles, keptOldFilesJson, deletedOldFilesJson);
        return ResponseUtil.success(null, "Thêm mới sản phẩm thành công");
    }

    @PostMapping("/many")
    @RequiresPermission("NMD_PRODUCT_CREATE_MANY")
    public ResponseEntity<ApiResponse<Void>> createManyProducts(
            @RequestBody List<ProductQuickCreationRequest> requests) {

        productService.createManyProducts(requests);
        return ResponseUtil.success(null, "Thêm mới nhiều sản phẩm thành công");
    }

    @PostMapping("/{id}/duplicate")
    @RequiresPermission("NMD_PRODUCT_CREATE")
    public ResponseEntity<ApiResponse<Void>> duplicateProduct(@PathVariable Long id) {
        productService.duplicateProduct(id);
        return ResponseUtil.success(null, "Sao chép sản phẩm thành công");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductShortResponse>>> getAllProducts() {
        List<ProductShortResponse> products = productService.getAllProducts();
        return ResponseUtil.success(products, "Lấy danh sách toàn bộ sản phẩm thành công");
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<Page<ProductShortResponse>>> getProductsByPage(
            Pageable pageable,
            @RequestParam(required = false) String search) {
        Page<ProductShortResponse> productsPage = productService.getProductsByPage(pageable, search);
        return ResponseUtil.success(productsPage, "Lấy danh sách sản phẩm theo trang thành công");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getProductById(
            @PathVariable Long id,
            @RequestParam(name = "isDetail", required = false, defaultValue = "false") boolean isDetail) {
        if (isDetail) {
            ProductDetailResponse productDetail = productService.getProductDetailById(id);
            return ResponseUtil.success(productDetail, "Lấy chi tiết sản phẩm thành công");
        } else {
            ProductShortResponse product = productService.getProductById(id);
            return ResponseUtil.success(product, "Lấy sản phẩm thành công");
        }
    }

    @GetMapping("/by-model")
    public ResponseEntity<ApiResponse<List<ProductShortResponse>>> getProductsByModelId(@RequestParam Long modelId) {
        List<ProductShortResponse> products = productService.getProductsByModelId(modelId);
        return ResponseUtil.success(products, "Lấy danh sách sản phẩm thành công");
    }

    @GetMapping("/by-mold")
    public ResponseEntity<ApiResponse<List<ProductShortResponse>>> getProductsByMoldId(@RequestParam Long moldId) {
        List<ProductShortResponse> products = productService.getProductsByMoldId(moldId);
        return ResponseUtil.success(products, "Lấy danh sách sản phẩm theo khuôn thành công");
    }

    @GetMapping("/by-customer")
    public ResponseEntity<ApiResponse<List<ProductShortResponse>>> getProductsByCustomer(
            @RequestParam Long customerId) {
        List<ProductShortResponse> products = productService.getProductsByCustomer(customerId);
        return ResponseUtil.success(products, "Lấy danh sách sản phẩm theo khách hàng thành công");
    }

    @GetMapping("/by-delay-mp")
    public ResponseEntity<ApiResponse<List<ProductShortResponse>>> getProductsByDelayMp() {
        List<ProductShortResponse> products = productService.getProductsByDelayMp();
        return ResponseUtil.success(products, "Lấy danh sách sản phẩm bị delay MP thành công");
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<ProductCategoryOptionDTO>>> getProductCategories() {
        List<ProductCategoryOptionDTO> categories = productService.getProductCategories();
        return ResponseUtil.success(categories, "Lấy danh sách loại sản phẩm thành công");
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<ApiResponse<List<ProductProgressResponse>>> getProductStatisticsByProgress(
            @PathVariable Long id) {
        List<ProductProgressResponse> progress = productService.getProgressByProductId(id);
        return ResponseUtil.success(progress, "Lấy báo cáo thống kê tiến độ sản phẩm thành công");
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<ProductHistoryResponse>>> getProductHistory(
            @PathVariable Long id,
            @RequestParam String fieldName) {
        List<ProductHistoryResponse> history = productHistoryService.getProductHistoryByFieldName(id, fieldName);
        return ResponseUtil.success(history, "Lấy lịch sử thay đổi trường '" + fieldName + "' thành công");
    }

    @PutMapping("/{id}")
    @RequiresPermission("NMD_PRODUCT_UPDATE")
    public ResponseEntity<ApiResponse<Void>> updateProduct(
            @PathVariable Long id,
            @RequestPart("data") ProductCreationRequest request,
            @RequestPart(value = "uploadFiles", required = false) List<MultipartFile> uploadFiles,
            @RequestPart(value = "keptOldFiles", required = false) String keptOldFilesJson,
            @RequestPart(value = "deletedOldFiles", required = false) String deletedOldFilesJson) {

        productService.updateProduct(id, request, uploadFiles, keptOldFilesJson, deletedOldFilesJson);
        return ResponseUtil.success(null, "Cập nhật sản phẩm thành công");
    }

    @PutMapping("/{id}/nmd-info")
    @RequiresPermission("NMD_PRODUCT_UPDATE_NMD_INFO")
    public ResponseEntity<ApiResponse<Void>> updateNmdInfoStatus(
            @PathVariable Long id,
            @RequestBody ProductNmdInfoUpdateRequest request) {
        boolean isSuperAdmin = SecurityUtils.hasRole(Role.SUPERADMIN);
        boolean isNmdDepartment = SecurityUtils.hasDepartmentCode("P-NMD");

        if (!isSuperAdmin && !isNmdDepartment) {
            throw new ForbiddenException("Bạn không có quyền thao tác xác nhận thông tin từ NMD");
        }

        productService.updateNmdInfoStatus(id, request);
        return ResponseUtil.success(null, "Cập nhật xác nhận thông tin từ NMD thành công");
    }

    @PatchMapping("/{id}/approve-by-head-kd")
    @RequiresPermission("NMD_PRODUCT_APPROVE_BY_HEAD_KD")
    public ResponseEntity<ApiResponse<Void>> approveProductByHeadKD(@PathVariable Long id) {
        productService.approveProductByHeadKD(id);
        return ResponseUtil.success(null, "Phê duyệt sản phẩm thành công");
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("NMD_PRODUCT_DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseUtil.success(null, "Xóa sản phẩm thành công");
    }
}
