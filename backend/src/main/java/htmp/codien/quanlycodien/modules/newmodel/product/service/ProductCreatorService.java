package htmp.codien.quanlycodien.modules.newmodel.product.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.common.exception.ConflictException;
import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.infrastructure.storage.FileStorageService;
import htmp.codien.quanlycodien.modules.mold.entity.Mold;
import htmp.codien.quanlycodien.modules.mold.repository.MoldRepository;
import htmp.codien.quanlycodien.modules.newmodel.mapping.entity.ProductResinMapping;
import htmp.codien.quanlycodien.modules.newmodel.plan.service.materialCategory.MaterialCategoryService;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductCreationRequest;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductQuickCreationRequest;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.Product;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductFile;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductInsert;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductMachine;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductMaterial;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductMoldDepreciation;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductPacking;
import htmp.codien.quanlycodien.modules.newmodel.product.enums.FileUploadProductType;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductResinMappingRepository;
import htmp.codien.quanlycodien.modules.newmodel.productModel.entity.Model;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductCategory;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductInsertType;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductInsertUnit;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductNmdInfoStatus;
import htmp.codien.quanlycodien.modules.newmodel.productModel.repository.ModelRepository;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationEvent;
import htmp.codien.quanlycodien.modules.notification.service.NotificationTriggerEvent;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductCreatorService {

    private final ModelRepository modelRepository;
    private final ProductRepository productRepository;
    private final MoldRepository moldRepository;
    private final ProductResinMappingRepository ProductResinMappingRepository;
    private final FileStorageService fileStorageService;
    private final ModelMapper modelMapper;
    private final ApplicationEventPublisher applicationEventPublisher;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private MaterialCategoryService materialCategoryService;

    public Product createProduct(Long modelId, ProductCreationRequest request, List<MultipartFile> uploadedFiles,
            String keptOldFilesJson, String deletedOldFilesJson) {

        Model model = modelRepository.findById(modelId)
                .orElseThrow(() -> new ResourceNotFoundException("Model không tồn tại với id: " + modelId));

        if (productRepository.existsByCode(request.getCode())) {
            throw new ConflictException("Mã sản phẩm '" + request.getCode() + "' đã tồn tại.");
        }

        Product product = new Product();
        product.setCode(request.getCode());
        product.setName(request.getName());
        product.setLifecycleYear(request.getLifecycleYear());
        product.setMonthlyOutput(request.getMonthlyOutput());
        product.setMoq(request.getMoq());
        product.setMdq(request.getMdq());
        product.setProductCategory(request.getProductCategory());
        product.setInfoReceivedDate(request.getInfoReceivedDate());
        product.setMpTargetDate(request.getMpTargetDate());
        product.setRemark(request.getProductRemark());
        product.setMold(null);
        product.setModel(model);
        product.setMarketType(request.getMarketType());
        ProductNmdInfoStatus initialNmdStatus = resolveInitialNmdStatus(request.getProductCategory());
        product.setNmdInfoStatus(initialNmdStatus);
        var creator = SecurityUtils.getCurrentEmployee();
        String initialActor = creator != null ? creator.getCode() + " - " + creator.getName() : "SYSTEM";
        product.setNmdInfoConfirmedBy(initialNmdStatus == ProductNmdInfoStatus.RECEIVED ? initialActor : null);
        product.setNmdInfoNote(initialNmdStatus == ProductNmdInfoStatus.RECEIVED
                ? "Đã xác nhận thông tin bởi: " + initialActor
                : null);
        product.setProductMaterials(new ArrayList<>());
        product.setProductInserts(new ArrayList<>());

        if (isSemiFinishedCategory(request.getProductCategory())) {
            product.setIsApprovedByHeadKD(true);
        } else {
            product.setIsApprovedByHeadKD(false);
        }

        if (request.getMoldCode() != null && !request.getMoldCode().isBlank()) {
            Mold mold = moldRepository.findByCode(request.getMoldCode())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Khuôn không tồn tại, bạn cần tạo khuôn trước khi thêm khuôn cho sản phẩm"));
            product.setMold(mold);
        }

        if (uploadedFiles != null && !uploadedFiles.isEmpty()) {
            for (MultipartFile file : uploadedFiles) {
                if (file == null || file.isEmpty())
                    continue;

                String fileUrl = fileStorageService.saveProductAttachment(
                        product.getModel().getCode(),
                        product.getCode(),
                        product.getName(),
                        FileUploadProductType.DEFAULT,
                        file);

                ProductFile productFile = ProductFile.builder()
                        .filePath(fileUrl)
                        .remark(file.getOriginalFilename())
                        .product(product)
                        .build();

                product.getFiles().add(productFile);
            }
        }

        if (request.getProductMaterials() != null
                && request.getProductMaterials().stream().anyMatch(m -> m.getRecyclingRate() > 100.0)) {
            throw new RuntimeException("Tỉ lệ lỗi ko được vướt quá 100%.");
        }

        attachChildEntities(product, request, false);

        Product savedProduct = productRepository.save(product);

        attachResins(savedProduct, request.getResinCodes());

        var current = SecurityUtils.getCurrentEmployee();
        applicationEventPublisher.publishEvent(
                new NotificationTriggerEvent(
                        NotificationEvent.PRODUCT_CREATED,
                        Map.of(
                                "modelId", model.getId(),
                                "productId", savedProduct.getId(),
                                "productCode", savedProduct.getCode(),
                                "employeeCode", current != null ? current.getCode() : "SYSTEM",
                                "employeeName", current != null ? current.getName() : "SYSTEM")));
        return savedProduct;
    }

    private void attachChildEntities(Product product, ProductCreationRequest request, boolean includeResins) {

        if (request.getProductMaterials() != null && !request.getProductMaterials().isEmpty()) {
            request.getProductMaterials().forEach(materialDTO -> {
                ProductMaterial material = modelMapper.map(materialDTO, ProductMaterial.class);
                material.setProduct(product);
                product.getProductMaterials().add(material);
            });
        }

        if (request.getProductMachine() != null) {
            ProductMachine machine = modelMapper.map(request.getProductMachine(), ProductMachine.class);
            machine.setProduct(product);
            product.setProductMachine(machine);
        }

        if (request.getProductPacking() != null) {
            ProductPacking packing = modelMapper.map(request.getProductPacking(), ProductPacking.class);
            packing.setProduct(product);
            product.setProductPacking(packing);
        }

        if (request.getProductMoldDepreciation() != null) {
            ProductMoldDepreciation depreciation = modelMapper.map(request.getProductMoldDepreciation(),
                    ProductMoldDepreciation.class);
            depreciation.setProduct(product);
            product.setProductMoldDepreciation(depreciation);
        }

        if (request.getProductInserts() != null && !request.getProductInserts().isEmpty()) {
            request.getProductInserts().forEach(insertDTO -> {
                ProductInsert insert = modelMapper.map(insertDTO, ProductInsert.class);
                insert.setProduct(product);
                if (insert.getType() == null) {
                    insert.setType(ProductInsertType.INSERT);
                }
                if (insert.getUnit() == null) {
                    insert.setUnit(ProductInsertUnit.PCS);
                }
                product.getProductInserts().add(insert);
            });
        }

        product.getProductEventRequirements()
                .addAll(ProductEventRequirementSupport.buildValidatedEventRequirements(
                        product,
                        request.getProductEventRequirements()));

        if (includeResins) {
            attachResins(product, request.getResinCodes());
        }
    }

    private void attachResins(Product product, List<String> resinCodes) {
        if (resinCodes == null || resinCodes.isEmpty()) {
            return;
        }

        if (materialCategoryService == null) {
            throw new IllegalStateException("Tertiary database (DB3) is not enabled. Cannot attach resins.");
        }

        for (String resinCode : resinCodes) {
            var resinsInDb3 = materialCategoryService.getResin(resinCode);
            if (resinsInDb3.isEmpty()) {
                throw new ResourceNotFoundException(
                        "Resin code '" + resinCode + "' không tồn tại trong DB3 (PostgreSQL dmvt)");
            }
        }

        resinCodes.forEach(resinCode -> {
            ProductResinMapping mapping = ProductResinMapping.builder()
                    .resinCode(resinCode)
                    .product(product)
                    .build();
            ProductResinMappingRepository.save(mapping);
            product.getProductResinMappings().add(mapping);
        });
    }

    private boolean isSemiFinishedCategory(ProductCategory category) {
        if (category == null) {
            return false;
        }
        return switch (category) {
            case SECOND_PROCESS_INJECTION,
                    SECOND_PROCESS_PRINT,
                    SECOND_PROCESS_PAINT,
                    SECOND_PROCESS_HOT_STAMPING,
                    SECOND_PROCESS_LASER ->
                true;
            default -> false;
        };
    }

    private ProductNmdInfoStatus resolveInitialNmdStatus(ProductCategory category) {
        if (isSemiFinishedCategory(category)) {
            return ProductNmdInfoStatus.RECEIVED;
        }
        return null;
    }

    public void createManyProducts(List<ProductQuickCreationRequest> requests) {
        Set<String> modelCodes = requests.stream()
                .map(ProductQuickCreationRequest::getModelCode)
                .collect(Collectors.toSet());
        Set<String> productCodes = new java.util.HashSet<>();

        List<Model> models = modelCodes.stream()
                .map(code -> modelRepository.findByCode(code)
                        .orElseThrow(() -> new ResourceNotFoundException("Model " + code + " không tồn tại")))
                .collect(Collectors.toList());

        Map<String, Model> modelCache = models.stream()
                .collect(Collectors.toMap(Model::getCode, m -> m));

        for (ProductQuickCreationRequest dto : requests) {
            if (!productCodes.add(dto.getProductCode()) || productRepository.existsByCode(dto.getProductCode())) {
                throw new ConflictException("Mã sản phẩm '" + dto.getProductCode() + "' đã tồn tại.");
            }

            Model model = modelCache.get(dto.getModelCode());
            if (model == null) {
                throw new RuntimeException("Model " + dto.getModelCode() + " không tồn tại");
            }

            Product product = new Product();
            if (dto.getMoldCode() != null && !dto.getMoldCode().isBlank()) {
                Mold mold = moldRepository.findByCode(dto.getMoldCode())
                        .orElseGet(() -> {
                            Mold newMold = new Mold();
                            newMold.setCode(dto.getMoldCode());
                            return moldRepository.save(newMold);
                        });
                product.setMold(mold);
            }

            product.setModel(model);
            product.setCode(dto.getProductCode());
            product.setName(dto.getProductName());

            productRepository.save(product);
        }
    }

    public Product duplicateProduct(Product original) {

        Product duplicatedProduct = new Product();

        String newCode = original.getCode() + "-DUP";
        if (productRepository.existsByCode(newCode)) {
            newCode = newCode + "-" + System.currentTimeMillis() % 1000;
        }

        duplicatedProduct.setCode(newCode);
        duplicatedProduct.setName(original.getName() + " (Copy)");
        duplicatedProduct.setModel(original.getModel());
        duplicatedProduct.setProductCategory(original.getProductCategory());
        duplicatedProduct.setLifecycleYear(original.getLifecycleYear());
        duplicatedProduct.setMonthlyOutput(original.getMonthlyOutput());
        duplicatedProduct.setMoq(original.getMoq());
        duplicatedProduct.setMdq(original.getMdq());
        duplicatedProduct.setMarketType(original.getMarketType());
        duplicatedProduct.setInfoReceivedDate(original.getInfoReceivedDate());
        duplicatedProduct.setMpTargetDate(original.getMpTargetDate());
        duplicatedProduct.setRemark(original.getRemark());
        duplicatedProduct.setMold(original.getMold());

        duplicatedProduct.setIsApprovedByHeadKD(original.getIsApprovedByHeadKD());
        duplicatedProduct.setNmdInfoStatus(original.getNmdInfoStatus());

        duplicatedProduct.setProductMaterials(new ArrayList<>());
        duplicatedProduct.setProductInserts(new ArrayList<>());
        duplicatedProduct.setFiles(new ArrayList<>());
        duplicatedProduct.setProductResinMappings(new ArrayList<>());
        duplicatedProduct.setProductPlans(new ArrayList<>());
        duplicatedProduct.setProductEventRequirements(new ArrayList<>());
        duplicatedProduct.setProductMpCheckList(null);

        if (original.getFiles() != null && !original.getFiles().isEmpty()) {
            original.getFiles().forEach(file -> {
                if (file == null || file.getFilePath() == null || file.getFilePath().isBlank()) {
                    return;
                }

                String copiedFilePath = fileStorageService.duplicateProductAttachment(
                        file.getFilePath(),
                        duplicatedProduct.getModel().getCode(),
                        duplicatedProduct.getCode(),
                        duplicatedProduct.getName());

                ProductFile newFile = ProductFile.builder()
                        .product(duplicatedProduct)
                        .filePath(copiedFilePath)
                        .remark(file.getRemark())
                        .build();

                duplicatedProduct.getFiles().add(newFile);
            });
        }

        if (original.getProductMaterials() != null) {
            original.getProductMaterials().forEach(m -> {
                ProductMaterial newM = new ProductMaterial();
                newM.setProduct(duplicatedProduct);
                newM.setIsQuotation(m.getIsQuotation());
                newM.setMatType(m.getMatType());
                newM.setMatGrade(m.getMatGrade());
                newM.setMatColorCode(m.getMatColorCode());
                newM.setMatColorName(m.getMatColorName());
                newM.setMatMaker(m.getMatMaker());
                newM.setMatMoq(m.getMatMoq());
                newM.setRecyclingRate(m.getRecyclingRate());
                newM.setRemark(m.getRemark());
                duplicatedProduct.getProductMaterials().add(newM);
            });
        }

        if (original.getProductInserts() != null) {
            original.getProductInserts().forEach(i -> {
                ProductInsert newI = new ProductInsert();
                newI.setProduct(duplicatedProduct);
                newI.setPlan(null);
                newI.setCode(i.getCode());
                newI.setName(i.getName());
                newI.setQuantity(i.getQuantity());
                newI.setSupplier(i.getSupplier());
                newI.setType(i.getType());
                newI.setUnit(i.getUnit());
                duplicatedProduct.getProductInserts().add(newI);
            });
        }

        if (original.getProductMachine() != null) {
            ProductMachine source = original.getProductMachine();
            ProductMachine machine = new ProductMachine();
            machine.setProduct(duplicatedProduct);
            machine.setMachineCapacityQuotation(source.getMachineCapacityQuotation());
            machine.setMachineCapacityTarget(source.getMachineCapacityTarget());
            machine.setMachineCapacityActual(source.getMachineCapacityActual());
            machine.setCycleTimeQuotation(source.getCycleTimeQuotation());
            machine.setCycleTimeTarget(source.getCycleTimeTarget());
            machine.setCycleTimeActual(source.getCycleTimeActual());
            machine.setProductWeightG(source.getProductWeightG());
            machine.setProductWeightActualG(source.getProductWeightActualG());
            machine.setRunnerWeightG(source.getRunnerWeightG());
            machine.setRunnerWeightActualG(source.getRunnerWeightActualG());
            machine.setCavity(source.getCavity());
            machine.setGateType(source.getGateType());
            machine.setRemark(source.getRemark());
            duplicatedProduct.setProductMachine(machine);
        }

        if (original.getProductPacking() != null) {
            ProductPacking source = original.getProductPacking();
            ProductPacking packing = new ProductPacking();
            packing.setProduct(duplicatedProduct);
            packing.setBoxType(source.getBoxType());
            packing.setCoverType(source.getCoverType());
            packing.setPcsPerCover(source.getPcsPerCover());
            packing.setCoverPerBox(source.getCoverPerBox());
            packing.setIsOneTimeBox(source.getIsOneTimeBox());
            packing.setBoxInvestQty(source.getBoxInvestQty());
            packing.setRemark(source.getRemark());
            duplicatedProduct.setProductPacking(packing);
        }

        if (original.getProductMoldDepreciation() != null) {
            ProductMoldDepreciation source = original.getProductMoldDepreciation();
            ProductMoldDepreciation depreciation = new ProductMoldDepreciation();
            depreciation.setProduct(duplicatedProduct);
            depreciation.setQuantityPcs(source.getQuantityPcs());
            depreciation.setYear(source.getYear());
            depreciation.setRemark(source.getRemark());
            duplicatedProduct.setProductMoldDepreciation(depreciation);
        }

        Product savedProduct = productRepository.save(duplicatedProduct);

        if (original.getProductResinMappings() != null && !original.getProductResinMappings().isEmpty()) {
            List<String> resinCodes = original.getProductResinMappings().stream()
                    .map(ProductResinMapping::getResinCode)
                    .collect(Collectors.toList());
            attachResins(savedProduct, resinCodes);
        }

        var current = SecurityUtils.getCurrentEmployee();
        applicationEventPublisher.publishEvent(
                new NotificationTriggerEvent(
                        NotificationEvent.PRODUCT_CREATED,
                        Map.of(
                                "modelId", savedProduct.getModel().getId(),
                                "productId", savedProduct.getId(),
                                "productCode", savedProduct.getCode(),
                                "employeeCode", current != null ? current.getCode() : "SYSTEM",
                                "employeeName", current != null ? current.getName() : "SYSTEM")));

        return savedProduct;
    }
}
