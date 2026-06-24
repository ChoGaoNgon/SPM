package htmp.codien.quanlycodien.modules.newmodel.productModel.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.modelmapper.ModelMapper;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;

import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.common.exception.ConflictException;
import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.common.util.ExcelUtils;
import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.common.util.TemplateUtils;
import htmp.codien.quanlycodien.infrastructure.excel.ExcelImportService;
import htmp.codien.quanlycodien.infrastructure.storage.FileStorageService;
import htmp.codien.quanlycodien.modules.customer.entity.Customer;
import htmp.codien.quanlycodien.modules.customer.repository.CustomerRepository;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.mail.entity.MailAddress;
import htmp.codien.quanlycodien.modules.mail.repository.MailAddressRepository;
import htmp.codien.quanlycodien.modules.mail.service.MailService;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.sendMail.SendModelMailRequest;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductDTO;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.Product;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductInsert;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductMachine;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductMaterial;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductMoldDepreciation;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductPacking;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.service.ProductDeletorService;
import htmp.codien.quanlycodien.modules.newmodel.productModel.dto.ModelRequest;
import htmp.codien.quanlycodien.modules.newmodel.productModel.dto.ModelResponse;
import htmp.codien.quanlycodien.modules.newmodel.productModel.entity.Model;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductCategory;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductInsertType;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductInsertUnit;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductMarketType;
import htmp.codien.quanlycodien.modules.newmodel.productModel.repository.ModelRepository;
import htmp.codien.quanlycodien.modules.newmodel.productModel.specification.ModelSpecification;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationEvent;
import htmp.codien.quanlycodien.modules.notification.service.NotificationTriggerEvent;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ModelServiceImpl implements ModelService {

        private final ModelRepository modelRepository;
        private final ProductRepository productRepository;
        private final CustomerRepository customerRepository;
        private final ModelMapper modelMapper;
        private final ProductDeletorService productDeletorService;
        private final FileStorageService fileStoreService;
        private final ApplicationEventPublisher applicationEventPublisher;
        private final ExcelImportService excelImportService;
        private final MailAddressRepository mailAddressRepository;
        private final MailService mailService;

        @Override
        @Transactional
        public void createModel(ModelRequest modelRequest) {
                try {

                        boolean exists = modelRepository.existsByCode(modelRequest.getCode());
                        if (exists) {
                                throw new ConflictException("Model với mã '" + modelRequest.getCode() + "' đã tồn tại");
                        }

                        Customer customer = customerRepository.findById(modelRequest.getCustomerId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Không tìm thấy khách hàng với ID: "
                                                                        + modelRequest.getCustomerId()));

                        Model model = Model.builder()
                                        .customer(customer)
                                        .code(modelRequest.getCode())
                                        .orderedDate(modelRequest.getOrderedDate())
                                        .build();

                        modelRepository.save(model);
                        var current = SecurityUtils.getCurrentEmployee();
                        applicationEventPublisher.publishEvent(
                                        new NotificationTriggerEvent(
                                                        NotificationEvent.MODEL_CREATED,
                                                        Map.of(
                                                                        "modelId", model.getId(),
                                                                        "modelCode", model.getCode(),
                                                                        "employeeCode",
                                                                        current != null ? current.getCode() : "SYSTEM",
                                                                        "employeeName",
                                                                        current != null ? current.getName()
                                                                                        : "SYSTEM")));
                } catch (ConflictException | ResourceNotFoundException e) {

                        throw e;
                } catch (Exception e) {

                        throw new RuntimeException("Lỗi khi tạo model mới: " + e.getMessage(), e);
                }
        }

        @Override
        @Transactional
        public void updateModel(Long id, ModelRequest modelRequest) {
                try {
                        Model existingModel = modelRepository.findById(id)
                                        .orElseThrow(() -> new ResourceNotFoundException("Model không tồn tại"));

                        if (!existingModel.getCode().equals(modelRequest.getCode())) {
                                boolean exists = modelRepository.existsByCode(modelRequest.getCode());
                                if (exists) {
                                        throw new ConflictException(
                                                        "Model với mã '" + modelRequest.getCode() + "' đã tồn tại");
                                }
                        }

                        existingModel.setCode(modelRequest.getCode());
                        existingModel.setOrderedDate(modelRequest.getOrderedDate());

                        if (!existingModel.getCustomer().getId().equals(modelRequest.getCustomerId())) {
                                Customer customer = customerRepository.findById(modelRequest.getCustomerId())
                                                .orElseThrow(() -> new ResourceNotFoundException(
                                                                "Không tìm thấy khách hàng với ID: "
                                                                                + modelRequest.getCustomerId()));
                                existingModel.setCustomer(customer);
                        }

                        modelRepository.save(existingModel);

                        var current = SecurityUtils.getCurrentEmployee();
                        applicationEventPublisher.publishEvent(
                                        new NotificationTriggerEvent(
                                                        NotificationEvent.MODEL_UPDATED,
                                                        Map.of(
                                                                        "modelId", existingModel.getId(),
                                                                        "modelCode", existingModel.getCode(),
                                                                        "employeeCode",
                                                                        current != null ? current.getCode() : "SYSTEM",
                                                                        "employeeName",
                                                                        current != null ? current.getName()
                                                                                        : "SYSTEM")));

                } catch (ConflictException | ResourceNotFoundException e) {
                        throw e;
                } catch (Exception e) {
                        throw new RuntimeException("Lỗi khi cập nhật model: " + e.getMessage(), e);
                }
        }

        @Override
        public Page<ModelResponse> searchModels(Pageable pageable, String keyword) {
                Specification<Model> spec = ModelSpecification.hasKeyword(keyword);

                return modelRepository.findAll(spec, pageable)
                                .map(model -> modelMapper.map(model, ModelResponse.class));
        }

        @Override
        public Page<ModelResponse> getAllModels(Pageable pageable) {
                return modelRepository.findAll(pageable)
                                .map(model -> {
                                        ModelResponse dto = modelMapper.map(model, ModelResponse.class);
                                        dto.setCustomerName(model.getCustomer().getName());
                                        return dto;
                                });
        }

        @Override
        public List<ProductDTO> getAllProductByModel(Long modelId) {
                Model model = modelRepository.findById(modelId)
                                .orElseThrow(() -> new ResourceNotFoundException("Model không tồn tại"));
                List<Product> products = productRepository.findByModel(model);

                return products.stream()
                                .map(product -> modelMapper.map(product, ProductDTO.class))
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional
        public void deleteModel(Long modelId) {
                Model model = modelRepository.findById(modelId)
                                .orElseThrow(() -> new RuntimeException("Model not found"));

                boolean isDirector = SecurityUtils.hasRole(Role.DIRECTOR);
                boolean isSuperAdmin = SecurityUtils.hasRole(Role.SUPERADMIN);
                boolean isHeadNMD = SecurityUtils.hasRole(Role.HEAD) && SecurityUtils.hasDepartmentCode("NMD");

                if (!model.getProducts().isEmpty() && !isDirector && !isSuperAdmin) {
                        throw new ConflictException("Model đã có sản phẩm, chỉ Ban Giám đốc mới được phép xóa");
                }

                if ((isSuperAdmin || isHeadNMD || isDirector) && model.getProducts().isEmpty()) {
                        modelRepository.delete(model);
                } else {

                        productDeletorService.deleteAllByModel(model);
                        modelRepository.deleteById(modelId);
                }

                fileStoreService.deleteFolder("models/" + model.getCode());

                var current = SecurityUtils.getCurrentEmployee();
                applicationEventPublisher.publishEvent(
                                new NotificationTriggerEvent(
                                                NotificationEvent.MODEL_DELETED,
                                                Map.of(
                                                                "modelCode", model.getCode(),
                                                                "employeeId", current != null ? current.getId() : 0L,
                                                                "employeeCode",
                                                                current != null ? current.getCode() : "SYSTEM",
                                                                "employeeName",
                                                                current != null ? current.getName() : "SYSTEM")));
        }

        @Override
        public Page<ModelResponse> searchByProductCodeOrMoldCode(Pageable pageable, String keyword) {
                Page<ModelResponse> models = modelRepository.findByProductCodeOrMoldCode(keyword, pageable);
                if (models == null || models.isEmpty()) {
                        throw new ResourceNotFoundException("Không tìm thấy model với mã sản phẩm hoặc mã khuôn");
                }
                return models;
        }

        @Override
        @Transactional
        public ModelResponse getModelById(Long modelId) {
                Model model = modelRepository.findById(modelId)
                                .orElseThrow(() -> new ResourceNotFoundException("Model không tồn tại!"));
                return modelMapper.map(model, ModelResponse.class);
        }

        @Override
        @Transactional
        public void importModelsFromExcel(MultipartFile file) {
                try (XSSFWorkbook workbook = new XSSFWorkbook(file.getInputStream())) {

                        JsonNode config = excelImportService.loadConfig("PRODUCT_IMPORT");

                        Sheet sheet = workbook.getSheetAt(config.get("sheetIndex").asInt());

                        List<Map<String, Object>> rows = excelImportService.parseExcel(sheet, config)
                                        .stream()
                                        .filter(r -> {
                                                String modelCode = ExcelUtils.getString(r, "modelCode");
                                                String productCode = ExcelUtils.getString(r, "productCode");
                                                return modelCode != null && !modelCode.isBlank()
                                                                && productCode != null && !productCode.isBlank();
                                        })
                                        .toList();

                        if (rows.isEmpty()) {
                                throw new RuntimeException(
                                                "Không đọc được modelCode/productCode từ file import. Kiểm tra technical header và dòng dữ liệu.");
                        }

                        Map<String, List<Map<String, Object>>> grouped = rows.stream()
                                        .collect(Collectors.groupingBy(
                                                        r -> ExcelUtils.getString(r, "modelCode") + "|"
                                                                        + ExcelUtils.getString(r, "productCode")));

                        Map<String, List<String>> productCodeToModelCodes = grouped.keySet().stream()
                                        .collect(Collectors.groupingBy(
                                                        key -> key.split("\\|", 2)[1],
                                                        Collectors.mapping(
                                                                        key -> key.split("\\|", 2)[0],
                                                                        Collectors.toList())));

                        for (var entry : productCodeToModelCodes.entrySet()) {
                                if (entry.getValue().stream().distinct().count() > 1) {
                                        throw new ConflictException("Mã sản phẩm '" + entry.getKey()
                                                        + "' bị trùng trong file import.");
                                }
                        }

                        for (var entry : grouped.entrySet()) {

                                String[] keys = entry.getKey().split("\\|");
                                String modelCode = keys[0];
                                String productCode = keys[1];

                                List<Map<String, Object>> productRows = entry.getValue();

                                Model model = modelRepository.findByCode(modelCode)
                                                .orElseThrow(() -> new ResourceNotFoundException(
                                                                "Model không tồn tại: " + modelCode));

                                if (productRepository.existsByCode(productCode)) {
                                        throw new ConflictException(
                                                        "Mã sản phẩm '" + productCode + "' đã tồn tại.");
                                }

                                Product product = mapToProduct(productRows, model);

                                productRepository.save(product);
                        }

                } catch (Exception e) {
                        throw new RuntimeException("Import Excel failed: " + e.getMessage(), e);
                }
        }

        private Product mapToProduct(List<Map<String, Object>> rows, Model model) {

                Map<String, Object> first = rows.get(0);

                boolean isHeadKD = SecurityUtils.hasRole(Role.HEAD) && SecurityUtils.hasDepartmentCode("KD");

                Product product = Product.builder()
                                .model(model)
                                .code(ExcelUtils.getString(first, "productCode"))
                                .name(ExcelUtils.getString(first, "productName"))
                                .productCategory(ProductCategory.valueOf(ExcelUtils.getString(first, "productType")))
                                .marketType(ProductMarketType.valueOf(ExcelUtils.getString(first, "productMarketType")))
                                .lifecycleYear(ExcelUtils.getInteger(first, "productLifecycleYear"))
                                .monthlyOutput(ExcelUtils.getInteger(first, "productMonthlyOutput"))
                                .moq(ExcelUtils.getInteger(first, "productMoq"))
                                .mdq(ExcelUtils.getInteger(first, "productMdq"))
                                .infoReceivedDate(ExcelUtils.toDate(first.get("productInfoReceivedDate")))
                                .mpTargetDate(ExcelUtils.toDate(first.get("productMpTargetDate")))
                                .remark(ExcelUtils.getString(first, "productNotes"))
                                .productMaterials(new ArrayList<>())
                                .productInserts(new ArrayList<>())
                                .productMachine(new ProductMachine())
                                .productMoldDepreciation(new ProductMoldDepreciation())
                                .productPacking(new ProductPacking())
                                .isApprovedByHeadKD(isHeadKD)
                                .build();

                for (Map<String, Object> row : rows) {

                        Map<String, Object> customerMaterial = ExcelUtils.getMap(row, "customerMaterial");

                        if (ExcelUtils.hasData(customerMaterial,
                                        "matType", "matGrade", "matColorCode", "matColorName", "matMaker")) {

                                product.getProductMaterials().add(
                                                ProductMaterial.builder()
                                                                .product(product)
                                                                .isQuotation(false)
                                                                .matType(ExcelUtils.getString(customerMaterial,
                                                                                "matType"))
                                                                .matGrade(ExcelUtils.getString(customerMaterial,
                                                                                "matGrade"))
                                                                .matColorCode(ExcelUtils.getString(customerMaterial,
                                                                                "matColorCode"))
                                                                .matColorName(ExcelUtils.getString(customerMaterial,
                                                                                "matColorName"))
                                                                .matMaker(ExcelUtils.getString(customerMaterial,
                                                                                "matMaker"))
                                                                .remark(ExcelUtils.getString(customerMaterial,
                                                                                "remark"))
                                                                .build());
                        }

                        Map<String, Object> quotationMaterial = ExcelUtils.getMap(row, "quotationMaterial");
                        if (ExcelUtils.hasData(quotationMaterial,
                                        "matType", "matGrade", "matColorCode", "matColorName", "matMaker")) {
                                product.getProductMaterials().add(
                                                ProductMaterial.builder()
                                                                .product(product)
                                                                .isQuotation(true)
                                                                .matType(ExcelUtils.getString(quotationMaterial,
                                                                                "matType"))
                                                                .matGrade(ExcelUtils.getString(quotationMaterial,
                                                                                "matGrade"))
                                                                .matColorCode(ExcelUtils.getString(quotationMaterial,
                                                                                "matColorCode"))
                                                                .matColorName(ExcelUtils.getString(quotationMaterial,
                                                                                "matColorName"))
                                                                .matMaker(ExcelUtils.getString(quotationMaterial,
                                                                                "matMaker"))
                                                                .matMoq(ExcelUtils.getInteger(quotationMaterial,
                                                                                "matMoq"))
                                                                .recyclingRate(ExcelUtils.getDouble(quotationMaterial,
                                                                                "recyclingRate"))
                                                                .remark(ExcelUtils.getString(quotationMaterial,
                                                                                "remark"))
                                                                .build());
                        }

                        Map<String, Object> insert = ExcelUtils.getMap(row, "insert");
                        if (ExcelUtils.hasData(insert, "type", "code", "name", "quantity", "unit", "supplier")) {
                                product.getProductInserts().add(
                                                ProductInsert.builder()
                                                                .product(product)
                                                                .type("X".equalsIgnoreCase(
                                                                                ExcelUtils.getString(insert, "type"))
                                                                                                ? ProductInsertType.PROCESS
                                                                                                : ProductInsertType.INSERT)
                                                                .code(ExcelUtils.getString(insert, "code"))
                                                                .name(ExcelUtils.getString(insert, "name"))
                                                                .quantity(ExcelUtils.getInteger(insert, "quantity"))
                                                                .unit("PCS".equalsIgnoreCase(
                                                                                ExcelUtils.getString(insert, "unit"))
                                                                                                ? ProductInsertUnit.PCS
                                                                                                : ProductInsertUnit.KG)
                                                                .supplier(ExcelUtils.getString(insert, "supplier"))
                                                                .build());
                        }

                        Map<String, Object> machine = ExcelUtils.getMap(row, "machine");
                        if (ExcelUtils.hasData(machine, "gateType", "cavity", "cycleTimeQuotation", "cycleTimeTarget",
                                        "machineCapacityQuotation", "machineCapacityTarget", "runnerWeightG",
                                        "productWeightG")) {
                                product.setProductMachine(
                                                ProductMachine.builder()
                                                                .product(product)
                                                                .gateType(ExcelUtils.getString(machine, "gateType"))
                                                                .cavity(ExcelUtils.getInteger(machine, "cavity"))
                                                                .cycleTimeQuotation(
                                                                                ExcelUtils.toBigDecimal(
                                                                                                ExcelUtils.getDouble(
                                                                                                                machine,
                                                                                                                "cycleTimeQuotation")))
                                                                .cycleTimeTarget(
                                                                                ExcelUtils.toBigDecimal(ExcelUtils
                                                                                                .getDouble(machine,
                                                                                                                "cycleTimeTarget")))
                                                                .machineCapacityQuotation(ExcelUtils.toBigDecimal(
                                                                                ExcelUtils.getDouble(machine,
                                                                                                "machineCapacityQuotation")))
                                                                .machineCapacityTarget(ExcelUtils.toBigDecimal(
                                                                                ExcelUtils.getDouble(machine,
                                                                                                "machineCapacityTarget")))
                                                                .runnerWeightG(ExcelUtils.toBigDecimal(
                                                                                ExcelUtils.getDouble(machine,
                                                                                                "runnerWeightG")))
                                                                .productWeightG(ExcelUtils.toBigDecimal(
                                                                                ExcelUtils.getDouble(machine,
                                                                                                "productWeightG")))
                                                                .remark(ExcelUtils.getString(machine, "remark"))
                                                                .build());
                        }

                        Map<String, Object> moldDepreciation = ExcelUtils.getMap(row, "moldDepreciation");
                        if (ExcelUtils.hasData(moldDepreciation, "year", "quantityPcs")) {
                                product.setProductMoldDepreciation(
                                                ProductMoldDepreciation.builder()
                                                                .product(product)
                                                                .year(ExcelUtils.getInteger(moldDepreciation, "year"))
                                                                .quantityPcs(ExcelUtils.getInteger(moldDepreciation,
                                                                                "quantityPcs"))
                                                                .remark(ExcelUtils.getString(moldDepreciation,
                                                                                "remark"))
                                                                .build());
                        }

                        Map<String, Object> packing = ExcelUtils.getMap(row, "packing");
                        if (ExcelUtils.hasData(packing, "boxType", "coverType", "boxInvestQty", "isOneTimeBox",
                                        "pcsPerCover", "coverPerBox")) {
                                product.setProductPacking(
                                                ProductPacking.builder()
                                                                .product(product)
                                                                .boxType(ExcelUtils.getString(packing, "boxType"))
                                                                .coverType(ExcelUtils.getString(packing, "coverType"))
                                                                .boxInvestQty(ExcelUtils.getInteger(packing,
                                                                                "boxInvestQty"))
                                                                .isOneTimeBox("X".equalsIgnoreCase(ExcelUtils
                                                                                .getString(packing, "isOneTimeBox")))
                                                                .pcsPerCover(ExcelUtils.getInteger(packing,
                                                                                "pcsPerCover"))
                                                                .coverPerBox(ExcelUtils.getInteger(packing,
                                                                                "coverPerBox"))
                                                                .remark(ExcelUtils.getString(packing, "remark"))
                                                                .build());
                        }

                }

                return product;
        }

        @Override
        @Transactional
        public void approveAndSendMail(SendModelMailRequest request) {

                Model model = modelRepository.findById(request.getModelId())
                                .orElseThrow(() -> new ResourceNotFoundException("Model không tồn tại!"));

                List<Product> products = productRepository.findByModel(model);
                products.forEach(product -> product.setIsApprovedByHeadKD(true));
                productRepository.saveAll(products);

                Employee currentEmployee = SecurityUtils.getCurrentEmployee();
                String title = request.getTitle() != null &&
                                !request.getTitle().isEmpty()
                                                ? request.getTitle()
                                                : "Thông tin Model mới: " + model.getCode();
                String htmlContent = TemplateUtils.loadHtmlTemplate("templates/mail/mold-trial-plan.html");

                String formattedContent = request.getContent()
                                .replace("\n", "<br>")
                                .replace("\r", "<br>")
                                .replace("\r\n", "<br>");

                htmlContent = htmlContent
                                .replace("{{content}}", formattedContent)
                                .replace("{{time}}", LocalDateTime.now().toString())
                                .replace("{{createdBy}}", currentEmployee.getName())
                                .replace("{{detailUrl}}",
                                                "https://apps.htmp.vn/product-manager/models/" + model.getId());

                List<String> toList = mailAddressRepository.findAllByIdIn(request.getTo())
                                .stream()
                                .map(MailAddress::getEmail)
                                .toList();
                List<String> ccList = mailAddressRepository.findAllByIdIn(request.getCc())
                                .stream()
                                .map(MailAddress::getEmail)
                                .toList();
                List<String> bccList = mailAddressRepository.findAllByIdIn(request.getBcc())
                                .stream()
                                .map(MailAddress::getEmail)
                                .toList();

                mailService.sendHtmlMail(
                                "default",
                                toList,
                                ccList,
                                bccList,
                                title,
                                htmlContent);

        }
}