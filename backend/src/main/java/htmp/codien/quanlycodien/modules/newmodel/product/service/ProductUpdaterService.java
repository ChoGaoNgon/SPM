package htmp.codien.quanlycodien.modules.newmodel.product.service;

import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.common.exception.ConflictException;
import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.infrastructure.storage.FileStorageService;
import htmp.codien.quanlycodien.modules.mold.entity.Mold;
import htmp.codien.quanlycodien.modules.mold.repository.MoldRepository;
import htmp.codien.quanlycodien.modules.newmodel.mapping.entity.ProductResinMapping;
import htmp.codien.quanlycodien.modules.newmodel.plan.service.materialCategory.MaterialCategoryService;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductCreationRequest;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductInsertDTO;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductMachineDTO;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductMaterialDTO;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductNmdInfoUpdateRequest;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductPackingDTO;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.Product;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductFile;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductInsert;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductMachine;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductMaterial;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductMoldDepreciation;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductPacking;
import htmp.codien.quanlycodien.modules.newmodel.product.enums.FileUploadProductType;
import htmp.codien.quanlycodien.modules.newmodel.product.helper.ProductAuditLogHelper;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductResinMappingRepository;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.entity.ProductEventRequirement;
import htmp.codien.quanlycodien.modules.newmodel.productModel.entity.Model;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductInsertType;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductInsertUnit;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductNmdInfoStatus;
import htmp.codien.quanlycodien.modules.newmodel.productModel.repository.ModelRepository;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationEvent;
import htmp.codien.quanlycodien.modules.notification.helper.NotificationHelper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductUpdaterService {

    private final ProductRepository productRepository;
    private final MoldRepository moldRepository;
    private final FileStorageService fileStorageService;
    private final ModelRepository modelRepository;
    private final ProductResinMappingRepository ProductResinMappingRepository;
    private final NotificationHelper notificationHelper;
    private final ProductAuditLogHelper auditLogHelper;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private MaterialCategoryService materialCategoryService;

    public Product updateProduct(Long productId, ProductCreationRequest request, List<MultipartFile> uploadFiles,
            String keptOldFilesJson, String deletedOldFilesJson) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm id: " + productId));

        boolean isSuperAdmin = SecurityUtils.hasRole(Role.SUPERADMIN);
        boolean isNmdDepartment = SecurityUtils.hasDepartmentCode("P-NMD");
        if (product.getNmdInfoStatus() == ProductNmdInfoStatus.RECEIVED && !(isSuperAdmin || isNmdDepartment)) {
            throw new IllegalStateException(
                    "Không thể chỉnh sửa sản phẩm đã nhận thông tin từ NMD. Vui lòng liên hệ Head KD để được hỗ trợ.");
        }

        if (request.getCode() != null && !request.getCode().equals(product.getCode())
                && productRepository.existsByCodeAndIdNot(request.getCode(), productId)) {
            throw new ConflictException("Mã sản phẩm '" + request.getCode() + "' đã tồn tại.");
        }

        String oldCode = product.getCode();
        String oldName = product.getName();
        Object oldMarketType = product.getMarketType();
        Object oldLifecycleYear = product.getLifecycleYear();
        Object oldMonthlyOutput = product.getMonthlyOutput();
        Object oldMoq = product.getMoq();
        Object oldMdq = product.getMdq();
        Object oldProductCategory = product.getProductCategory();
        Object oldInfoReceivedDate = product.getInfoReceivedDate();
        Object oldMpTargetDate = product.getMpTargetDate();
        String oldRemark = product.getRemark();
        String oldMoldCode = product.getMold() != null ? product.getMold().getCode() : null;
        Long oldModelId = product.getModel() != null ? product.getModel().getId() : null;

        product.setNmdInfoStatus(ProductNmdInfoStatus.PENDING);
        product.setNmdInfoConfirmedBy(null);
        product.setNmdInfoNote(null);
        product.setNmdInfoConfirmedBy(null);
        product.setNmdInfoNote(null);
        product.setMarketType(request.getMarketType());

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
        product.setNmdInfoStatus(ProductNmdInfoStatus.PENDING);

        if (request.getMoldCode() != null && !request.getMoldCode().isBlank()) {
            Mold mold = moldRepository.findByCode(request.getMoldCode())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy mold với code: " + request.getMoldCode()));
            product.setMold(mold);
        }

        if (request.getModelId() != null) {
            Model model = modelRepository.findById(request.getModelId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Không tìm thấy Model id: " + request.getModelId()));
            product.setModel(model);
        }

        try {
            ObjectMapper mapper = new ObjectMapper();

            List<String> deletedOldFiles = deletedOldFilesJson != null
                    ? mapper.readValue(deletedOldFilesJson, new TypeReference<List<String>>() {
                    })
                    : Collections.emptyList();

            Iterator<ProductFile> fileIterator = product.getFiles().iterator();
            while (fileIterator.hasNext()) {
                ProductFile file = fileIterator.next();
                if (deletedOldFiles.contains(file.getRemark())) {
                    fileStorageService.deleteFile(file.getFilePath());
                    fileIterator.remove();
                }
            }

            if (uploadFiles != null) {
                for (MultipartFile newFile : uploadFiles) {
                    if (newFile == null || newFile.isEmpty())
                        continue;

                    String fileUrl = fileStorageService.saveProductAttachment(
                            product.getModel().getCode(),
                            product.getCode(),
                            product.getName(),
                            FileUploadProductType.DEFAULT,
                            newFile);

                    ProductFile issueFile = ProductFile.builder()
                            .filePath(fileUrl)
                            .remark(newFile.getOriginalFilename())
                            .product(product)
                            .build();

                    product.getFiles().add(issueFile);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xử lý file đính kèm: " + e.getMessage(), e);
        }

        updateChildrenDiff(productId, product, request);

        Product savedProduct = productRepository.save(product);

        auditLogHelper.logIfChanged(productId, "code", oldCode, savedProduct.getCode());
        auditLogHelper.logIfChanged(productId, "name", oldName, savedProduct.getName());
        auditLogHelper.logIfChanged(productId, "marketType", oldMarketType, savedProduct.getMarketType());
        auditLogHelper.logIfChanged(productId, "lifecycleYear", oldLifecycleYear, savedProduct.getLifecycleYear());
        auditLogHelper.logIfChanged(productId, "monthlyOutput", oldMonthlyOutput, savedProduct.getMonthlyOutput());
        auditLogHelper.logIfChanged(productId, "moq", oldMoq, savedProduct.getMoq());
        auditLogHelper.logIfChanged(productId, "mdq", oldMdq, savedProduct.getMdq());
        auditLogHelper.logIfChanged(productId, "productCategory", oldProductCategory,
                savedProduct.getProductCategory());
        auditLogHelper.logIfChanged(productId, "infoReceivedDate", oldInfoReceivedDate,
                savedProduct.getInfoReceivedDate());
        auditLogHelper.logIfChanged(productId, "mpTargetDate", oldMpTargetDate, savedProduct.getMpTargetDate());
        auditLogHelper.logIfChanged(productId, "remark", oldRemark, savedProduct.getRemark());
        String newMoldCode = savedProduct.getMold() != null ? savedProduct.getMold().getCode() : null;
        auditLogHelper.logIfChanged(productId, "moldCode", oldMoldCode, newMoldCode);
        Long newModelId = savedProduct.getModel() != null ? savedProduct.getModel().getId() : null;
        auditLogHelper.logIfChanged(productId, "modelId", oldModelId, newModelId);

        var current = SecurityUtils.getCurrentEmployee();
        notificationHelper.fireNotification(NotificationEvent.PRODUCT_UPDATED, Map.of(
                "modelId", product.getModel().getId(),
                "productId", savedProduct.getId(),
                "productCode", savedProduct.getCode(),
                "employeeCode", current != null ? current.getCode() : "SYSTEM",
                "employeeName", current != null ? current.getName() : "SYSTEM"));

        return savedProduct;

    }

    public void approveProductByHeadKD(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm id: " + productId));

        product.setIsApprovedByHeadKD(true);
        product.setNmdInfoStatus(ProductNmdInfoStatus.PENDING);
        product.setNmdInfoConfirmedBy(null);
        product.setNmdInfoNote(null);
        productRepository.save(product);

        var current = SecurityUtils.getCurrentEmployee();
        notificationHelper.fireNotification(NotificationEvent.PRODUCT_APPROVED_BY_HEAD_KD, Map.of(
                "productId", product.getId(),
                "productCode", product.getCode(),
                "productName", product.getName() != null ? product.getName() : "",
                "modelId", product.getModel().getId(),
                "modelCode", product.getModel().getCode() != null ? product.getModel().getCode() : "",
                "productCategory", product.getProductCategory() != null
                        ? product.getProductCategory().getDescription()
                        : "",
                "approverCode", current != null ? current.getCode() : "SYSTEM",
                "approverName", current != null ? current.getName() : "SYSTEM",
                "employeeCode", current != null ? current.getCode() : "SYSTEM",
                "createdBy", product.getCreatedBy() != null ? product.getCreatedBy() : "SYSTEM"));
    }

    public Product updateNmdInfoStatus(Long productId, ProductNmdInfoUpdateRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm id: " + productId));

        ProductNmdInfoStatus status = request.getStatus();
        if (status == null || status == ProductNmdInfoStatus.PENDING) {
            throw new IllegalArgumentException("Vui lòng chọn trạng thái RECEIVED hoặc RETURNED");
        }

        if (status == ProductNmdInfoStatus.RETURNED && (request.getRemark() == null || request.getRemark().isBlank())) {
            throw new IllegalArgumentException("Vui lòng nhập remark khi trả lại yêu cầu");
        }

        ProductNmdInfoStatus oldStatus = product.getNmdInfoStatus();

        product.setNmdInfoStatus(status);

        var current = SecurityUtils.getCurrentEmployee();
        String actorDisplay = current != null ? current.getCode() + " - " + current.getName() : "SYSTEM";
        if (current != null) {
            product.setNmdInfoConfirmedBy(actorDisplay);
        } else {
            product.setNmdInfoConfirmedBy("SYSTEM");
        }

        String rawRemark = request.getRemark() != null ? request.getRemark().trim() : "";
        product.setNmdInfoNote(buildNmdInfoNote(status, actorDisplay, rawRemark));

        Product savedProduct = productRepository.save(product);

        auditLogHelper.logIfChanged(productId, "nmdInfoStatus", oldStatus, savedProduct.getNmdInfoStatus());

        notificationHelper.fireNotification(NotificationEvent.PRODUCT_NMD_INFO_STATUS_UPDATED, Map.of(
                "modelId", savedProduct.getModel().getId(),
                "productId", savedProduct.getId(),
                "productCode", savedProduct.getCode(),
                "nmdInfoStatus", savedProduct.getNmdInfoStatus().name(),
                "nmdInfoNote", savedProduct.getNmdInfoNote() != null ? savedProduct.getNmdInfoNote() : "",
                "nmdInfoConfirmedBy", savedProduct.getNmdInfoConfirmedBy() != null
                        ? savedProduct.getNmdInfoConfirmedBy()
                        : "SYSTEM",
                "employeeCode", current != null ? current.getCode() : "SYSTEM",
                "employeeName", current != null ? current.getName() : "SYSTEM"));

        return savedProduct;
    }

    private String buildNmdInfoNote(ProductNmdInfoStatus status, String actorDisplay, String rawRemark) {
        StringBuilder noteBuilder = new StringBuilder();

        if (status == ProductNmdInfoStatus.RECEIVED) {
            noteBuilder.append("Đã xác nhận thông tin bởi: ").append(actorDisplay);
        } else if (status == ProductNmdInfoStatus.RETURNED) {
            noteBuilder.append("Đã trả lại yêu cầu bởi: ").append(actorDisplay);
        }

        if (rawRemark != null && !rawRemark.isBlank()) {
            noteBuilder.append("\nGhi chú: ").append(rawRemark);
        }

        return noteBuilder.toString();
    }

    private void updateChildrenDiff(Long productId, Product product, ProductCreationRequest request) {
        List<ProductMaterial> currentMaterials = product.getProductMaterials();
        List<ProductMaterialDTO> reqMaterials = request.getProductMaterials();
        if (reqMaterials != null) {
            currentMaterials.removeIf(mat -> {
                boolean removed = reqMaterials.stream()
                        .noneMatch(dto -> dto.getId() != null && dto.getId().equals(mat.getId()));
                if (removed) {
                    auditLogHelper.logIfChanged(productId, "materials.removed",
                            mat.getMatType() + " | " + mat.getMatGrade(), null);
                }
                return removed;
            });
            for (ProductMaterialDTO dto : reqMaterials) {
                if (dto.getId() != null) {
                    ProductMaterial exist = currentMaterials.stream().filter(m -> dto.getId().equals(m.getId()))
                            .findFirst().orElse(null);
                    if (exist != null) {
                        auditLogHelper.logIfChanged(productId, "materials." + exist.getId() + ".matType",
                                exist.getMatType(), dto.getMatType());
                        auditLogHelper.logIfChanged(productId, "materials." + exist.getId() + ".matGrade",
                                exist.getMatGrade(), dto.getMatGrade());
                        auditLogHelper.logIfChanged(productId, "materials." + exist.getId() + ".matColorCode",
                                exist.getMatColorCode(), dto.getMatColorCode());
                        auditLogHelper.logIfChanged(productId, "materials." + exist.getId() + ".matColorName",
                                exist.getMatColorName(), dto.getMatColorName());
                        auditLogHelper.logIfChanged(productId, "materials." + exist.getId() + ".matMaker",
                                exist.getMatMaker(), dto.getMatMaker());
                        auditLogHelper.logIfChanged(productId, "materials." + exist.getId() + ".recyclingRate",
                                exist.getRecyclingRate(), dto.getRecyclingRate());
                        applyMaterial(dto, exist);
                        continue;
                    }
                }
                ProductMaterial material = new ProductMaterial();
                applyMaterial(dto, material);
                material.setProduct(product);
                currentMaterials.add(material);
                auditLogHelper.logIfChanged(productId, "materials.added",
                        null, dto.getMatType() + " | " + dto.getMatGrade());
            }
        } else {
            if (!currentMaterials.isEmpty()) {
                auditLogHelper.logIfChanged(productId, "materials.cleared", currentMaterials.size() + " items", null);
            }
            currentMaterials.clear();
        }

        List<ProductInsert> currentInserts = product.getProductInserts();
        List<ProductInsertDTO> reqInserts = request.getProductInserts();
        if (reqInserts != null) {
            currentInserts.removeIf(ins -> {
                boolean removed = reqInserts.stream()
                        .noneMatch(dto -> dto.getId() != null && dto.getId().equals(ins.getId()));
                if (removed) {
                    auditLogHelper.logIfChanged(productId, "inserts.removed", ins.getCode() + " | " + ins.getName(),
                            null);
                }
                return removed;
            });
            for (ProductInsertDTO dto : reqInserts) {
                if (dto.getId() != null) {
                    ProductInsert exist = currentInserts.stream().filter(i -> dto.getId().equals(i.getId())).findFirst()
                            .orElse(null);
                    if (exist != null) {
                        auditLogHelper.logIfChanged(productId, "inserts." + exist.getId() + ".code", exist.getCode(),
                                dto.getCode());
                        auditLogHelper.logIfChanged(productId, "inserts." + exist.getId() + ".name", exist.getName(),
                                dto.getName());
                        auditLogHelper.logIfChanged(productId, "inserts." + exist.getId() + ".quantity",
                                exist.getQuantity(), dto.getQuantity());
                        auditLogHelper.logIfChanged(productId, "inserts." + exist.getId() + ".supplier",
                                exist.getSupplier(), dto.getSupplier());
                        applyInsert(dto, exist);
                        if (exist.getType() == null)
                            exist.setType(ProductInsertType.INSERT);
                        if (exist.getUnit() == null)
                            exist.setUnit(ProductInsertUnit.PCS);
                        continue;
                    }
                }
                ProductInsert insert = new ProductInsert();
                applyInsert(dto, insert);
                insert.setProduct(product);
                if (insert.getType() == null)
                    insert.setType(ProductInsertType.INSERT);
                if (insert.getUnit() == null)
                    insert.setUnit(ProductInsertUnit.PCS);
                currentInserts.add(insert);
                auditLogHelper.logIfChanged(productId, "inserts.added", null, dto.getCode() + " | " + dto.getName());
            }
        } else {
            if (!currentInserts.isEmpty()) {
                auditLogHelper.logIfChanged(productId, "inserts.cleared", currentInserts.size() + " items", null);
            }
            currentInserts.clear();
        }

        List<ProductEventRequirement> currentEvents = product.getProductEventRequirements();
        List<htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.productEventRequirement.ProductEventRequirementRequest> reqEvents = request
                .getProductEventRequirements();
        if (reqEvents != null) {
            currentEvents.removeIf(ev -> {
                boolean removed = reqEvents.stream()
                        .noneMatch(dto -> dto.getName() != null && dto.getName().equals(ev.getName()));
                if (removed) {
                    auditLogHelper.logIfChanged(productId, "eventRequirements.removed", ev.getName(), null);
                }
                return removed;
            });
            for (var dto : reqEvents) {
                ProductEventRequirement exist = currentEvents.stream()
                        .filter(e -> dto.getName() != null && dto.getName().equals(e.getName())).findFirst()
                        .orElse(null);
                if (exist != null) {
                    auditLogHelper.logIfChanged(productId, "eventRequirements." + exist.getName() + ".deliveryDate",
                            exist.getDeliveryDate(), dto.getDeliveryDate());
                    auditLogHelper.logIfChanged(productId, "eventRequirements." + exist.getName() + ".quantity",
                            exist.getQuantity(), dto.getQuantity());
                    exist.setDeliveryDate(
                            dto.getDeliveryDate() != null ? java.time.LocalDate.parse(dto.getDeliveryDate()) : null);
                    exist.setQuantity(dto.getQuantity());
                    continue;
                }
                ProductEventRequirement event = ProductEventRequirement.builder()
                        .product(product)
                        .name(dto.getName())
                        .deliveryDate(
                                dto.getDeliveryDate() != null ? java.time.LocalDate.parse(dto.getDeliveryDate()) : null)
                        .quantity(dto.getQuantity())
                        .build();
                currentEvents.add(event);
                auditLogHelper.logIfChanged(productId, "eventRequirements.added", null, dto.getName());
            }
        } else {
            if (!currentEvents.isEmpty()) {
                auditLogHelper.logIfChanged(productId, "eventRequirements.cleared", currentEvents.size() + " items",
                        null);
            }
            currentEvents.clear();
        }

        List<ProductResinMapping> currentResins = product.getProductResinMappings();
        List<String> reqResinCodes = request.getResinCodes();
        if (reqResinCodes != null) {
            if (materialCategoryService == null && !reqResinCodes.isEmpty()) {
                throw new IllegalStateException("Tertiary database (DB3) is not enabled. Cannot attach resins.");
            }
            for (String resinCode : reqResinCodes) {
                var resinsInDb3 = materialCategoryService.getResin(resinCode);
                if (resinsInDb3.isEmpty()) {
                    throw new ResourceNotFoundException(
                            "Resin code '" + resinCode + "' không tồn tại trong DB3 (PostgreSQL dmvt)");
                }
            }
            currentResins.removeIf(r -> {
                boolean removed = reqResinCodes.stream().noneMatch(code -> code.equals(r.getResinCode()));
                if (removed) {
                    auditLogHelper.logIfChanged(productId, "resins.removed", r.getResinCode(), null);
                }
                return removed;
            });
            for (String code : reqResinCodes) {
                if (currentResins.stream().noneMatch(r -> code.equals(r.getResinCode()))) {
                    ProductResinMapping mapping = ProductResinMapping.builder().resinCode(code).product(product)
                            .build();
                    ProductResinMappingRepository.save(mapping);
                    currentResins.add(mapping);
                    auditLogHelper.logIfChanged(productId, "resins.added", null, code);
                }
            }
        } else {
            if (!currentResins.isEmpty()) {
                auditLogHelper.logIfChanged(productId, "resins.cleared", currentResins.size() + " items", null);
            }
            currentResins.clear();
        }

        if (request.getProductMachine() != null) {
            if (product.getProductMachine() != null) {
                ProductMachine m = product.getProductMachine();
                ProductMachineDTO src = request.getProductMachine();
                auditLogHelper.logIfChanged(productId, "machine.machineCapacityQuotation",
                        m.getMachineCapacityQuotation(), src.getMachineCapacityQuotation());
                auditLogHelper.logIfChanged(productId, "machine.machineCapacityTarget", m.getMachineCapacityTarget(),
                        src.getMachineCapacityTarget());
                auditLogHelper.logIfChanged(productId, "machine.cycleTimeQuotation", m.getCycleTimeQuotation(),
                        src.getCycleTimeQuotation());
                auditLogHelper.logIfChanged(productId, "machine.cycleTimeTarget", m.getCycleTimeTarget(),
                        src.getCycleTimeTarget());
                auditLogHelper.logIfChanged(productId, "machine.cavity", m.getCavity(), src.getCavity());
                auditLogHelper.logIfChanged(productId, "machine.gateType", m.getGateType(), src.getGateType());
                applyMachine(src, m);
            } else {
                ProductMachine machine = new ProductMachine();
                applyMachine(request.getProductMachine(), machine);
                machine.setProduct(product);
                product.setProductMachine(machine);
                auditLogHelper.logIfChanged(productId, "machine.added", null, "machine info added");
            }
        } else {
            if (product.getProductMachine() != null) {
                auditLogHelper.logIfChanged(productId, "machine.removed", "machine info", null);
            }
            product.setProductMachine(null);
        }

        if (request.getProductPacking() != null) {
            if (product.getProductPacking() != null) {
                ProductPacking p = product.getProductPacking();
                ProductPackingDTO src = request.getProductPacking();
                auditLogHelper.logIfChanged(productId, "packing.boxType", p.getBoxType(), src.getBoxType());
                auditLogHelper.logIfChanged(productId, "packing.coverType", p.getCoverType(), src.getCoverType());
                auditLogHelper.logIfChanged(productId, "packing.pcsPerCover", p.getPcsPerCover(), src.getPcsPerCover());
                auditLogHelper.logIfChanged(productId, "packing.coverPerBox", p.getCoverPerBox(), src.getCoverPerBox());
                auditLogHelper.logIfChanged(productId, "packing.isOneTimeBox", p.getIsOneTimeBox(),
                        src.getIsOneTimeBox());
                auditLogHelper.logIfChanged(productId, "packing.boxInvestQty", p.getBoxInvestQty(),
                        src.getBoxInvestQty());
                applyPacking(src, p);
            } else {
                ProductPacking packing = new ProductPacking();
                applyPacking(request.getProductPacking(), packing);
                packing.setProduct(product);
                product.setProductPacking(packing);
                auditLogHelper.logIfChanged(productId, "packing.added", null, "packing info added");
            }
        } else {
            if (product.getProductPacking() != null) {
                auditLogHelper.logIfChanged(productId, "packing.removed", "packing info", null);
            }
            product.setProductPacking(null);
        }

        if (request.getProductMoldDepreciation() != null) {
            if (product.getProductMoldDepreciation() != null) {
                ProductMoldDepreciation d = product.getProductMoldDepreciation();
                var src = request.getProductMoldDepreciation();
                auditLogHelper.logIfChanged(productId, "depreciation.quantityPcs", d.getQuantityPcs(),
                        src.getQuantityPcs());
                auditLogHelper.logIfChanged(productId, "depreciation.year", d.getYear(), src.getDepreciationYear());
                applyDepreciation(src, d);
            } else {
                ProductMoldDepreciation depreciation = new ProductMoldDepreciation();
                applyDepreciation(request.getProductMoldDepreciation(), depreciation);
                depreciation.setProduct(product);
                product.setProductMoldDepreciation(depreciation);
                auditLogHelper.logIfChanged(productId, "depreciation.added", null, "depreciation info added");
            }
        } else {
            if (product.getProductMoldDepreciation() != null) {
                auditLogHelper.logIfChanged(productId, "depreciation.removed", "depreciation info", null);
            }
            product.setProductMoldDepreciation(null);
        }
    }

    private void applyMaterial(ProductMaterialDTO source, ProductMaterial target) {
        target.setIsQuotation(source.getIsQuotation());
        target.setMatType(source.getMatType());
        target.setMatGrade(source.getMatGrade());
        target.setMatColorCode(source.getMatColorCode());
        target.setMatColorName(source.getMatColorName());
        target.setMatMaker(source.getMatMaker());
        target.setMatMoq(source.getMatMoq());
        target.setRecyclingRate(source.getRecyclingRate());
        target.setRemark(source.getRemark());
    }

    private void applyInsert(ProductInsertDTO source, ProductInsert target) {
        target.setCode(source.getCode());
        target.setName(source.getName());
        target.setQuantity(source.getQuantity());
        target.setSupplier(source.getSupplier());
        target.setType(source.getType());
        target.setUnit(source.getUnit());
    }

    private void applyMachine(ProductMachineDTO source,
            ProductMachine target) {
        target.setMachineCapacityQuotation(source.getMachineCapacityQuotation());
        target.setMachineCapacityTarget(source.getMachineCapacityTarget());
        target.setCycleTimeQuotation(source.getCycleTimeQuotation());
        target.setCycleTimeTarget(source.getCycleTimeTarget());
        target.setProductWeightG(source.getProductWeightG());
        target.setProductWeightActualG(source.getProductWeightActualG());
        target.setRunnerWeightG(source.getRunnerWeightG());
        target.setRunnerWeightActualG(source.getRunnerWeightActualG());
        target.setCavity(source.getCavity());
        target.setGateType(source.getGateType());
        target.setRemark(source.getMachineRemark());
    }

    private void applyPacking(ProductPackingDTO source,
            ProductPacking target) {
        target.setBoxType(source.getBoxType());
        target.setCoverType(source.getCoverType());
        target.setPcsPerCover(source.getPcsPerCover());
        target.setCoverPerBox(source.getCoverPerBox());
        target.setIsOneTimeBox(source.getIsOneTimeBox());
        target.setBoxInvestQty(source.getBoxInvestQty());
        target.setRemark(source.getRemark());
    }

    private void applyDepreciation(
            htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductMoldDepreciationDTO source,
            ProductMoldDepreciation target) {
        target.setQuantityPcs(source.getQuantityPcs());
        target.setYear(source.getDepreciationYear());
        target.setRemark(source.getDepreciationRemark());
    }

}
