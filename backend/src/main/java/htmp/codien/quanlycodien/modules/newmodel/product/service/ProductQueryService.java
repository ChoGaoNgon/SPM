package htmp.codien.quanlycodien.modules.newmodel.product.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.Product;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductRepository;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.ProductProjection;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductQueryService {

    private final ProductRepository productRepository;

    public List<Product> getProductsByModelId(Long modelId) {
        return productRepository.findByModelId(modelId);
    }

    public List<Product> getProductsByMoldId(Long moldId) {
        return productRepository.findByMoldId(moldId);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public List<Product> getProductsByCustomer(Long customerId) {
        return productRepository.findByModelCustomerId(customerId);
    }

    public Product getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm id: " + id));

        product.getProductResinMappings().size();
        product.getProductMaterials().size();
        product.getProductInserts().size();
        product.getFiles().size();

        return product;
    }

    public List<ProductProjection> getProductByMpDelay() {
        return productRepository.findProductByMpDelay();
    }
}
