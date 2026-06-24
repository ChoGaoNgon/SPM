package htmp.codien.quanlycodien.modules.newmodel.product.service;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.ProductCategoryOptionDTO;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {

    void createProducts(Long moldelId, ProductCreationRequest request, List<MultipartFile> uploadedFiles,
            String keptOldFilesJson, String deletedOldFilesJson);

    void approveProductByHeadKD(Long id);

    void updateProduct(Long id, ProductCreationRequest request, List<MultipartFile> uploadFiles,
            String keptOldFilesJson, String deletedOldFilesJson);

    void updateNmdInfoStatus(Long id, ProductNmdInfoUpdateRequest request);

    void deleteProduct(Long id);

    List<ProductShortResponse> getProductsByModelId(Long modelId);

    List<ProductShortResponse> getProductsByMoldId(Long moldId);

    List<ProductCategoryOptionDTO> getProductCategories();

    ProductShortResponse getProductById(Long id);

    ProductDetailResponse getProductDetailById(Long id);

    List<ProductProgressResponse> getProgressByProductId(Long id);

    void createManyProducts(List<ProductQuickCreationRequest> requests);

    List<ProductShortResponse> getAllProducts();

    void duplicateProduct(Long id);

    Page<ProductShortResponse> getProductsByPage(Pageable pageable, String search);

    List<ProductShortResponse> getProductsByCustomer(Long customerId);

    List<ProductShortResponse> getProductsByDelayMp();
}