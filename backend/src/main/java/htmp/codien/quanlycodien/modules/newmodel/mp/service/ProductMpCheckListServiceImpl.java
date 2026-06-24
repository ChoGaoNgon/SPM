package htmp.codien.quanlycodien.modules.newmodel.mp.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import htmp.codien.quanlycodien.common.enums.ApprovalStatus;
import htmp.codien.quanlycodien.common.enums.HtmpResult;
import htmp.codien.quanlycodien.common.exception.ConflictException;
import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.common.util.JsonUtils;
import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.infrastructure.storage.FileStorageService;
import htmp.codien.quanlycodien.modules.department.entity.Department;
import htmp.codien.quanlycodien.modules.department.repository.DepartmentRepository;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.newmodel.mp.dto.productMpCheckList.ProductMpCheckItemRequest;
import htmp.codien.quanlycodien.modules.newmodel.mp.dto.productMpCheckList.ProductMpCheckListResponse;
import htmp.codien.quanlycodien.modules.newmodel.mp.entity.*;
import htmp.codien.quanlycodien.modules.newmodel.mp.repository.*;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.Product;
import htmp.codien.quanlycodien.modules.newmodel.product.enums.FileUploadProductType;
import htmp.codien.quanlycodien.modules.newmodel.product.enums.ProductStatus;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductMpCheckListServiceImpl implements ProductMpCheckListService {
    private final ProductMpCheckItemTemplateRepository productMpCheckItemTemplateRepository;
    private final ProductMpCheckListRepository productMpCheckListRepository;
    private final ProductMpCheckItemRepository productMpCheckItemRepository;
    private final ProductMpFileRepository productMpFileRepository;
    private final ProductRepository productRepository;
    private final DepartmentRepository departmentRepository;
    private final FileStorageService fileStorageService;
    private final EmployeeRepository employeeRepository;
    private final ProductMpApprovalRepository productMpApprovalRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public void createMpCheckList(Long productId, String delayReason) {

        if (productMpCheckListRepository.existsByProductId(productId)) {
            throw new ConflictException("MP Checklist đã tồn tại cho sản phẩm này");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + productId));

        if (product.getStatus() == ProductStatus.CLOSED) {
            throw new ConflictException("Sản phẩm đã đóng, không thể tạo MP Checklist");
        }

        ProductMpCheckList checkList = new ProductMpCheckList();
        checkList.setProduct(product);

        List<ProductMpCheckItemTemplate> templates = productMpCheckItemTemplateRepository.findByIsActiveTrue();

        List<ProductMpCheckItem> checkItems = templates.stream()
                .map(t -> {
                    ProductMpCheckItem item = new ProductMpCheckItem();
                    item.setType(t.getType());
                    item.setName(t.getName());
                    item.setRequestContent(t.getRequestContent());
                    item.setStandard(t.getStandard());
                    item.setResponsibility1(t.getResponsibility1());
                    item.setResponsibility2(t.getResponsibility2());
                    item.setProductMpCheckList(checkList);
                    return item;
                })
                .toList();

        checkList.setProductMpCheckItems(checkItems);

        List<String> approvalDeptCodes = List.of("P-NMD", "P-QC&QA", "KT", "P-SX", "BGD");

        List<ProductMpApproval> approvals = approvalDeptCodes.stream()
                .map(code -> {
                    Department dept = departmentRepository.findByCode(code)
                            .orElseThrow(
                                    () -> new ResourceNotFoundException("Không tìm thấy phòng ban với mã: " + code));

                    ProductMpApproval approval = new ProductMpApproval();
                    approval.setDepartment(dept);
                    approval.setStatus(ApprovalStatus.PENDING);
                    approval.setProductMpCheckList(checkList);
                    return approval;
                })
                .toList();

        checkList.setApprovals(approvals);

        product.setMpDelayReason(delayReason);
        product.setStatus(ProductStatus.MP_WAITTING);
        productRepository.save(product);

        productMpCheckListRepository.save(checkList);
    }

    @Override
    public ProductMpCheckListResponse getByProductId(Long productId) {
        ProductMpCheckList checkList = productMpCheckListRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy check sheet MP cho sản phẩm với id: " + productId));

        return mapToResponse(checkList);
    }

    @Override
    public void deleteByProductId(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + productId));

        Long checkListId = productMpCheckListRepository.findCheckListIdByProductId(productId)
                .orElse(null);

        if (checkListId == null) {
            return;
        }
        productMpCheckListRepository.deleteFilesByCheckListId(checkListId);
        productMpCheckListRepository.deleteCheckItemsByCheckListId(checkListId);
        productMpCheckListRepository.deleteApprovalsByCheckListId(checkListId);
        productMpCheckListRepository.deleteCheckListById(checkListId);

        product.setStatus(ProductStatus.MP_CANCELED);
        productRepository.save(product);
    }

    private ProductMpCheckListResponse mapToResponse(ProductMpCheckList checkList) {
        return ProductMpCheckListResponse.builder()
                .id(checkList.getId())
                .productId(checkList.getProduct().getId())
                .productCode(checkList.getProduct().getCode())
                .productName(checkList.getProduct().getName())
                .delayMpReason(checkList.getProduct().getMpDelayReason())
                .createdBy(resolveCreatedByEmployee(checkList.getCreatedBy()))
                .createdAt(checkList.getCreatedAt())
                .checkItems(mapCheckItems(checkList.getProductMpCheckItems()))
                .approvals(mapApprovals(checkList.getApprovals()))
                .build();
    }

    private ProductMpCheckListResponse.ProductMpCreatorDto resolveCreatedByEmployee(String createdByCode) {
        if (createdByCode == null || createdByCode.isBlank()) {
            return null;
        }
        return employeeRepository.findByCode(createdByCode)
                .map(employee -> ProductMpCheckListResponse.ProductMpCreatorDto.builder()
                        .id(employee.getId())
                        .code(employee.getCode())
                        .name(employee.getName())
                        .build())
                .orElse(ProductMpCheckListResponse.ProductMpCreatorDto.builder()
                        .code(createdByCode)
                        .name(createdByCode)
                        .build());
    }

    private List<ProductMpCheckListResponse.ProductMpCheckItemDto> mapCheckItems(
            List<ProductMpCheckItem> items) {
        if (items == null || items.isEmpty()) {
            return new ArrayList<>();
        }
        return items.stream()
                .map(item -> ProductMpCheckListResponse.ProductMpCheckItemDto.builder()
                        .id(item.getId())
                        .type(item.getType() != null ? item.getType().toString() : null)
                        .name(item.getName())
                        .requestContent(item.getRequestContent())
                        .standard(item.getStandard())
                        .responsibility1Id(item.getResponsibility1() != null ? item.getResponsibility1().getId() : null)
                        .responsibility1Code(
                                item.getResponsibility1() != null ? item.getResponsibility1().getCode() : null)
                        .responsibility1Name(
                                item.getResponsibility1() != null ? item.getResponsibility1().getName() : null)
                        .responsibility2Id(item.getResponsibility2() != null ? item.getResponsibility2().getId() : null)
                        .responsibility2Code(
                                item.getResponsibility2() != null ? item.getResponsibility2().getCode() : null)
                        .responsibility2Name(
                                item.getResponsibility2() != null ? item.getResponsibility2().getName() : null)
                        .resultByResponsibility1(
                                item.getResultByResponsibility1() != null ? item.getResultByResponsibility1().toString()
                                        : null)
                        .resultByResponsibility2(
                                item.getResultByResponsibility2() != null ? item.getResultByResponsibility2().toString()
                                        : null)
                        .assignById(item.getAssignedBy() != null ? item.getAssignedBy().getId() : null)
                        .assignByName(item.getAssignedBy() != null ? item.getAssignedBy().getName() : null)
                        .receivedById(item.getReceivedBy() != null ? item.getReceivedBy().getId() : null)
                        .receivedByName(item.getReceivedBy() != null ? item.getReceivedBy().getName() : null)
                        .finalResult(item.getFinalResult() != null ? item.getFinalResult().toString() : null)
                        .remark(item.getRemark())
                        .files(mapFiles(item.getProductMpFiles()))
                        .build())
                .collect(Collectors.toList());
    }

    private List<ProductMpCheckListResponse.ProductMpFileDto> mapFiles(List<ProductMpFile> files) {
        if (files == null || files.isEmpty()) {
            return new ArrayList<>();
        }
        return files.stream()
                .map(file -> ProductMpCheckListResponse.ProductMpFileDto.builder()
                        .id(file.getId())
                        .filePath(file.getFilePath())
                        .build())
                .collect(Collectors.toList());
    }

    private List<ProductMpCheckListResponse.ProductMpApprovalDto> mapApprovals(
            List<ProductMpApproval> approvals) {
        if (approvals == null || approvals.isEmpty()) {
            return new ArrayList<>();
        }
        return approvals.stream()
                .map(approval -> ProductMpCheckListResponse.ProductMpApprovalDto.builder()
                        .id(approval.getId())
                        .departmentId(approval.getDepartment().getId())
                        .departmentCode(approval.getDepartment().getCode())
                        .departmentName(approval.getDepartment().getName())
                        .approvedById(approval.getApprovedBy() != null ? approval.getApprovedBy().getId() : null)
                        .approvedByName(approval.getApprovedBy() != null ? approval.getApprovedBy().getName() : null)
                        .comment(approval.getComment())
                        .status(approval.getStatus() != null ? approval.getStatus().toString() : null)
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public void updateCheckItem(Long checkItemId, ProductMpCheckItemRequest req, List<MultipartFile> uploadFiles,
            String keptOldFilesJson, String deletedOldFilesJson) {

        ProductMpCheckItem checkItem = productMpCheckItemRepository.findById(checkItemId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy mục kiểm tra MP với id: " + checkItemId));

        Employee responsibility1 = req.getEmployeeResponsibility1Id() != null
                ? employeeRepository.findById(req.getEmployeeResponsibility1Id())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Nhân viên với id " + req.getEmployeeResponsibility1Id() + " không tồn tại"))
                : null;

        Employee responsibility2 = req.getEmployeeResponsibility2Id() != null
                ? employeeRepository.findById(req.getEmployeeResponsibility2Id())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Nhân viên với id " + req.getEmployeeResponsibility2Id() + " không tồn tại"))
                : null;

        checkItem.setAssignedBy(responsibility1);
        checkItem.setReceivedBy(responsibility2);

        if (req.getResultByResponsibility1() != null) {
            try {
                checkItem.setResultByResponsibility1(HtmpResult.valueOf(req.getResultByResponsibility1()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Kết quả trách nhiệm 1 không hợp lệ");
            }
        }

        if (req.getResultByResponsibility2() != null) {
            try {
                checkItem.setResultByResponsibility2(HtmpResult.valueOf(req.getResultByResponsibility2()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Kết quả trách nhiệm 2 không hợp lệ");
            }
        }

        if (checkItem.getResultByResponsibility1() != null && checkItem.getResultByResponsibility2() != null) {
            boolean result1Pass = checkItem.getResultByResponsibility1() == HtmpResult.OK;
            boolean result2Pass = checkItem.getResultByResponsibility2() == HtmpResult.OK;
            checkItem.setFinalResult(result1Pass && result2Pass ? HtmpResult.OK : HtmpResult.NG);
        } else if (checkItem.getResultByResponsibility1() != null) {
            checkItem.setFinalResult(checkItem.getResultByResponsibility1());
        } else if (checkItem.getResultByResponsibility2() != null) {
            checkItem.setFinalResult(checkItem.getResultByResponsibility2());
        }

        if (req.getRemark() != null) {
            checkItem.setRemark(req.getRemark());
        }

        List<String> deletedFileNames = JsonUtils.parseJsonToStringList(objectMapper, deletedOldFilesJson);



        if (!deletedFileNames.isEmpty()) {
            List<ProductMpFile> existingFiles = productMpFileRepository.findByProductMpCheckItemId(checkItemId);
            if (!existingFiles.isEmpty()) {
                List<ProductMpFile> toDelete = new ArrayList<>();
                for (ProductMpFile f : existingFiles) {
                    String fileName = Paths.get(f.getFilePath()).getFileName().toString();
                    if (deletedFileNames.contains(fileName)) {
                        try {
                            fileStorageService.deleteFile(f.getFilePath());
                        } catch (Exception e) {

                        }
                        toDelete.add(f);
                    }
                }
                if (!toDelete.isEmpty()) {
                    productMpFileRepository.deleteAllInBatch(toDelete);
                }
            }
        }

        String modelCode = checkItem.getProductMpCheckList().getProduct().getModel().getCode();
        String productCode = checkItem.getProductMpCheckList().getProduct().getCode();

        if (uploadFiles != null && !uploadFiles.isEmpty()) {
            for (MultipartFile file : uploadFiles) {
                if (!file.isEmpty()) {
                    try {

                        String filePath = fileStorageService.saveProductAttachment(
                                modelCode,
                                productCode,
                                "MP",
                                FileUploadProductType.DEFAULT,
                                file);

                        ProductMpFile mpFile = new ProductMpFile();
                        mpFile.setFilePath(filePath);
                        mpFile.setProductMpCheckItem(checkItem);
                        productMpFileRepository.save(mpFile);
                    } catch (Exception e) {
                        throw new RuntimeException("Lỗi tải lên file: " + e.getMessage());
                    }
                }
            }
        }

        productMpCheckItemRepository.save(checkItem);
    }

    @Override
    public void approveCheckList(Long approvalId, String comment) {
        ProductMpApproval approval = productMpApprovalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy phê duyệt với id: " + approvalId));

        if (approval.getStatus() != ApprovalStatus.PENDING) {
            throw new ConflictException("Phê duyệt đã được xử lý trước đó");
        }

        Long currentEmployeeId = SecurityUtils.getCurrentEmployeeId();
        Employee currentEmployee = employeeRepository.findById(currentEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy nhân viên với id: " + currentEmployeeId));

        approval.setStatus(ApprovalStatus.APPROVED);
        approval.setApprovedBy(currentEmployee);
        approval.setComment(comment);

        productMpApprovalRepository.save(approval);

        ProductMpCheckList checkList = approval.getProductMpCheckList();
        boolean allApproved = checkList.getApprovals().stream()
                .allMatch(a -> a.getStatus() == ApprovalStatus.APPROVED);

        if (allApproved) {
            Product product = checkList.getProduct();
            product.setStatus(ProductStatus.MP);
            productRepository.save(product);
        }
    }

    @Override
    public void rejectCheckList(Long approvalId, String comment) {
        ProductMpApproval approval = productMpApprovalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy phê duyệt với id: " + approvalId));

        if (approval.getStatus() != ApprovalStatus.PENDING) {
            throw new ConflictException("Phê duyệt đã được xử lý trước đó");
        }

        Long currentEmployeeId = SecurityUtils.getCurrentEmployeeId();
        Employee currentEmployee = employeeRepository.findById(currentEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy nhân viên với id: " + currentEmployeeId));

        approval.setStatus(ApprovalStatus.REJECTED);
        approval.setApprovedBy(currentEmployee);
        approval.setComment(comment);

        productMpApprovalRepository.save(approval);

        Product product = approval.getProductMpCheckList().getProduct();
        product.setStatus(ProductStatus.MP_WAITTING);
        productRepository.save(product);
    }
}
