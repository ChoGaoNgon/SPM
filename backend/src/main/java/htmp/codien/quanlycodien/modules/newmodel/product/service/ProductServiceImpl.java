package htmp.codien.quanlycodien.modules.newmodel.product.service;

import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.ProductCategoryOptionDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productMoldTrialPlanIssue.ProductPlanIssueFileResponse;
import htmp.codien.quanlycodien.modules.newmodel.plan.service.productResin.ProductResinService;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.*;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.Product;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductHistoryRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.specification.ProductSpecification;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.productEventRequirement.ProductEventRequirementRequest;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductCategory;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ModelMapper modelMapper;

    private final ProductCreatorService productCreatorService;
    private final ProductUpdaterService productUpdaterService;
    private final ProductQueryService productQueryService;
    private final ProductDeletorService productDeletorService;
    private final ProductProgressService productProgressService;
    private final ProductRepository productRepository;
    private final EmployeeRepository employeeRepository;
    private final ProductHistoryRepository productHistoryRepository;
    @Autowired(required = false)
    private ProductResinService productResinService;

    @Override
    public void createProducts(Long modelId, ProductCreationRequest request, List<MultipartFile> uploadFiles,
            String keptOldFilesJson, String deletedOldFilesJson) {
        productCreatorService.createProduct(modelId, request, uploadFiles, keptOldFilesJson, deletedOldFilesJson);
    }

    @Override
    public void approveProductByHeadKD(Long id) {
        productUpdaterService.approveProductByHeadKD(id);
    }

    @Override
    public void updateProduct(Long id, ProductCreationRequest request, List<MultipartFile> uploadFiles,
            String keptOldFilesJson, String deletedOldFilesJson) {
        productUpdaterService.updateProduct(id, request, uploadFiles, keptOldFilesJson, deletedOldFilesJson);
    }

    @Override
    public void updateNmdInfoStatus(Long id, ProductNmdInfoUpdateRequest request) {
        productUpdaterService.updateNmdInfoStatus(id, request);
    }

    @Override
    public List<ProductShortResponse> getProductsByModelId(Long modelId) {
        List<Product> products = productQueryService.getProductsByModelId(modelId);
        return products.stream()
                .map(p -> {
                    ProductShortResponse response = modelMapper.map(p, ProductShortResponse.class);
                    if (p.getModel() != null) {
                        response.setCustomerName(p.getModel().getCustomer().getName());
                    }
                    if (p.getProductCategory() != null) {
                        response.setCategoryName(p.getProductCategory().getDescription());
                        response.setCategoryColor(p.getProductCategory().getColor());
                    }
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductShortResponse> getProductsByMoldId(Long moldId) {
        List<Product> products = productQueryService.getProductsByMoldId(moldId);
        return products.stream()
                .map(p -> {
                    ProductShortResponse response = modelMapper.map(p, ProductShortResponse.class);
                    if (p.getModel() != null) {
                        response.setCustomerName(p.getModel().getCustomer().getName());
                    }
                    if (p.getProductCategory() != null) {
                        response.setCategoryName(p.getProductCategory().getDescription());
                        response.setCategoryColor(p.getProductCategory().getColor());
                    }
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductShortResponse> getAllProducts() {
        List<Product> products = productQueryService.getAllProducts();
        return products.stream()
                .map(p -> {
                    ProductShortResponse response = modelMapper.map(p, ProductShortResponse.class);
                    if (p.getModel() != null) {
                        response.setCustomerName(p.getModel().getCustomer().getName());
                    }
                    if (p.getProductCategory() != null) {
                        response.setCategoryName(p.getProductCategory().getDescription());
                        response.setCategoryColor(p.getProductCategory().getColor());
                    }
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    public ProductShortResponse getProductById(Long id) {
        Product product = productQueryService.getProductById(id);
        ProductShortResponse response = modelMapper.map(product, ProductShortResponse.class);
        if (product.getModel() != null) {
            response.setCustomerName(product.getModel().getCustomer().getName());
        }
        if (product.getProductCategory() != null) {
            response.setCategoryName(product.getProductCategory().getDescription());
            response.setCategoryColor(product.getProductCategory().getColor());
        }
        return response;
    }

    @Override
    public ProductDetailResponse getProductDetailById(Long id) {
        Product product = productQueryService.getProductById(id);
        ProductDetailResponse response = modelMapper.map(product, ProductDetailResponse.class);

        response.setCreatedByCode(product.getCreatedBy());
        employeeRepository.findByCode(product.getCreatedBy()).ifPresent(employee -> {
            response.setCreatedByName(employee.getName());
            if (employee.getDepartment() != null) {
                response.setCreatedByDepartmentCode(employee.getDepartment().getCode());
                response.setCreatedByDepartmentName(employee.getDepartment().getName());
            }
        });

        if (product.getProductCategory() != null) {
            response.setCategoryName(product.getProductCategory().getDescription());
            response.setCategoryColor(product.getProductCategory().getColor());
        }

        response.setFiles(product.getFiles().stream()
                .map(file -> ProductPlanIssueFileResponse.builder()
                        .id(file.getId())
                        .filePath(file.getFilePath())
                        .remark(file.getRemark())
                        .build())
                .collect(Collectors.toSet()));

        List<ProductResinMappingDTO> ProductResinMappingDTOs;
        if (productResinService != null) {
            List<ProductResinDTO> productResins = productResinService.getProductResins(id);
            ProductResinMappingDTOs = productResins.stream()
                    .map(pr -> ProductResinMappingDTO.builder()
                            .id(null)
                            .code(pr.getResinCode())
                            .type(pr.getType())
                            .colorName(pr.getColorName())
                            .grade(pr.getGrade())
                            .description(pr.getDescription())
                            .build())
                    .collect(Collectors.toList());
        } else {

            ProductResinMappingDTOs = product.getProductResinMappings().stream()
                    .map(ProductResinMapping -> ProductResinMappingDTO.builder()
                            .id(null)
                            .code(ProductResinMapping.getResinCode())
                            .type(null)
                            .colorName(null)
                            .grade(null)
                            .description(null)
                            .build())
                    .collect(Collectors.toList());
        }
        response.setProductResinMappings(ProductResinMappingDTOs);

        List<ProductMaterialDTO> materialDTOs = product.getProductMaterials().stream()
                .map(material -> modelMapper.map(material, ProductMaterialDTO.class))
                .collect(Collectors.toList());
        response.setProductMaterials(materialDTOs);

        List<ProductInsertDTO> insertDTOs = product.getProductInserts().stream()
                .map(insert -> modelMapper.map(insert, ProductInsertDTO.class))
                .collect(Collectors.toList());
        response.setProductInserts(insertDTOs);

        List<ProductEventRequirementRequest> eventRequirementDTOs = product.getProductEventRequirements().stream()
                .map(eventRequirement -> ProductEventRequirementRequest.builder()
                        .productId(product.getId())
                        .name(eventRequirement.getName())
                        .deliveryDate(eventRequirement.getDeliveryDate() != null
                                ? eventRequirement.getDeliveryDate().toString()
                                : null)
                        .quantity(eventRequirement.getQuantity())
                        .build())
                .collect(Collectors.toList());
        response.setProductEventRequirements(eventRequirementDTOs);

        List<ProductHistorySummaryResponse> historySummary = productHistoryRepository.countChangesByField(id);
        response.setHistorySummary(historySummary);

        List<ProductHistoryResponse> historyDetails = productHistoryRepository.findByProduct_IdOrderByCreatedAtDesc(id)
                .stream()
                .map(h -> {
                    String changerName = h.getCreatedBy() != null
                            ? employeeRepository.findByCode(h.getCreatedBy())
                                    .map(e -> e.getName())
                                    .orElse(h.getCreatedBy())
                            : null;
                    return ProductHistoryResponse.builder()
                            .fieldName(h.getFieldName())
                            .oldValue(h.getOldValue())
                            .newValue(h.getNewValue())
                            .createdAt(h.getCreatedAt())
                            .createdByCode(h.getCreatedBy())
                            .createdByName(changerName)
                            .build();
                })
                .collect(Collectors.toList());
        response.setHistoryDetails(historyDetails);

        return response;
    }

    @Override
    public List<ProductCategoryOptionDTO> getProductCategories() {
        return java.util.Arrays.stream(ProductCategory.values())
                .map(category -> ProductCategoryOptionDTO.builder()
                        .code(category.name())
                        .name(category.getDescription())
                        .color(category.getColor())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productQueryService.getProductById(id);
        productDeletorService.deleteOne(product);
    }

    @Override
    public List<ProductProgressResponse> getProgressByProductId(Long id) {
        return productProgressService.getProgressByProductId(id);
    }

    @Override
    public void createManyProducts(List<ProductQuickCreationRequest> requests) {
        productCreatorService.createManyProducts(requests);
    }

    @Override
    public void duplicateProduct(Long id) {

        Product originalProduct = productQueryService.getProductById(id);

        productCreatorService.duplicateProduct(originalProduct);
    }

    @Override
    public Page<ProductShortResponse> getProductsByPage(Pageable pageable, String search) {
        Specification<Product> spec = ProductSpecification.hasKeyword(search);

        return productRepository.findAll(spec, pageable)
                .map(product -> {
                    ProductShortResponse response = modelMapper.map(product, ProductShortResponse.class);
                    if (product.getModel() != null) {
                        response.setCustomerName(product.getModel().getCustomer().getName());
                    }
                    if (product.getProductCategory() != null) {
                        response.setCategoryName(product.getProductCategory().getDescription());
                        response.setCategoryColor(product.getProductCategory().getColor());
                    }
                    return response;
                });
    }

    @Override
    public List<ProductShortResponse> getProductsByCustomer(Long customerId) {
        List<Product> products = productQueryService.getProductsByCustomer(customerId);
        return products.stream()
                .map(p -> {
                    ProductShortResponse response = modelMapper.map(p, ProductShortResponse.class);
                    if (p.getModel() != null) {
                        response.setCustomerName(p.getModel().getCustomer().getName());
                    }
                    if (p.getProductCategory() != null) {
                        response.setCategoryName(p.getProductCategory().getDescription());
                        response.setCategoryColor(p.getProductCategory().getColor());
                    }
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductShortResponse> getProductsByDelayMp() {
        return productQueryService.getProductByMpDelay().stream()
                .map(p -> ProductShortResponse.builder()
                        .id(p.getId())
                        .code(p.getCode())
                        .name(p.getName())
                        .modelId(p.getModelId())
                        .modelCode(p.getModelCode())
                        .moldCode(p.getMoldCode())
                        .mpDelayReason(p.getMpDelayReason())
                        .build())
                .collect(Collectors.toList());
    }

}