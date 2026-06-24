package htmp.codien.quanlycodien.modules.newmodel.plan.service.productResin;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.modules.newmodel.mapping.entity.ProductResinMapping;
import htmp.codien.quanlycodien.modules.newmodel.plan.service.materialCategory.MaterialCategoryService;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductResinDTO;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductResinMappingDTO;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.Product;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductResinMappingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@ConditionalOnBean(name = "tertiaryJdbcTemplate")
@Slf4j
public class ProductResinService {

    private final ProductResinMappingRepository ProductResinMappingRepository;
    private final ProductRepository productRepository;
    private final MaterialCategoryService materialCategoryService;

    public List<ProductResinDTO> getProductResins(Long productId) {
        List<ProductResinMapping> mappings = ProductResinMappingRepository.findByProductId(productId);

        if (mappings.isEmpty()) {
            return List.of();
        }

        List<String> resinCodes = mappings.stream()
                .map(ProductResinMapping::getResinCode)
                .collect(Collectors.toList());

        Map<String, ProductResinMappingDTO> resinDetailsMap = resinCodes.stream()
                .map(code -> materialCategoryService.getResin(code))
                .flatMap(List::stream)
                .collect(Collectors.toMap(
                        ProductResinMappingDTO::getCode,
                        dto -> dto,
                        (existing, replacement) -> existing));

        return mappings.stream()
                .map(mapping -> {
                    ProductResinMappingDTO detail = resinDetailsMap.get(mapping.getResinCode());

                    return ProductResinDTO.builder()
                            .id(mapping.getId())
                            .productId(productId)
                            .resinCode(mapping.getResinCode())
                            .percentage(mapping.getPercentage())
                            .remark(mapping.getRemark())
                            .type(detail != null ? detail.getType() : null)
                            .colorName(detail != null ? detail.getColorName() : null)
                            .grade(detail != null ? detail.getGrade() : null)
                            .description(detail != null ? detail.getDescription() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void addResinToProduct(Long productId, String resinCode, Double percentage, String remark) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        List<ProductResinMappingDTO> resins = materialCategoryService.getResin(resinCode);
        if (resins.isEmpty()) {
            throw new RuntimeException("Resin code not found in DB3: " + resinCode);
        }

        boolean exists = ProductResinMappingRepository.existsByProductIdAndResinCode(productId, resinCode);
        if (exists) {
            throw new RuntimeException("Resin already added to this product");
        }

        ProductResinMapping mapping = ProductResinMapping.builder()
                .resinCode(resinCode)
                .percentage(percentage)
                .remark(remark)
                .product(product)
                .build();

        ProductResinMappingRepository.save(mapping);
        log.info("Added resin {} to product {}", resinCode, productId);
    }

    @Transactional
    public void removeResinFromProduct(Long mappingId) {
        ProductResinMappingRepository.deleteById(mappingId);
        log.info("Removed resin mapping id: {}", mappingId);
    }

    @Transactional
    public void updateResinMapping(Long mappingId, Double percentage, String remark) {
        ProductResinMapping mapping = ProductResinMappingRepository.findById(mappingId)
                .orElseThrow(() -> new RuntimeException("Mapping not found: " + mappingId));

        mapping.setPercentage(percentage);
        mapping.setRemark(remark);

        ProductResinMappingRepository.save(mapping);
        log.info("Updated resin mapping id: {}", mappingId);
    }
}
