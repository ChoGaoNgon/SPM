package htmp.codien.quanlycodien.modules.newmodel.productTool.service;

import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.Product;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductRepository;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ToolPreparationStatus;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ToolPreparationType;
import htmp.codien.quanlycodien.modules.newmodel.productTool.dto.ProductToolPreparationDTO;
import htmp.codien.quanlycodien.modules.newmodel.productTool.dto.ProductToolPreparationItemDTO;
import htmp.codien.quanlycodien.modules.newmodel.productTool.dto.ProductToolPreparationItemRequest;
import htmp.codien.quanlycodien.modules.newmodel.productTool.dto.ProductToolPreparationRequest;
import htmp.codien.quanlycodien.modules.newmodel.productTool.entity.ProductToolPreparationItem;
import htmp.codien.quanlycodien.modules.newmodel.productTool.repository.ProductToolPreparationItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductToolPreparationServiceImpl implements ProductToolPreparationService {

        private final ProductToolPreparationItemRepository toolPreparationItemRepository;
        private final ProductRepository productRepository;
        private final EmployeeRepository employeeRepository;

        @Override
        @Transactional
        public void createToolPreparationsForProduct(Long productId) {
                productRepository.findById(productId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy sản phẩm với ID: " + productId));

        }

        @Override
        @Transactional
        public ProductToolPreparationDTO createToolPreparation(ProductToolPreparationRequest request) {
                Product product = getProductOrThrow(request.getProductId());
                ToolPreparationType processType = requireProcessType(request.getProcessType());
                Employee responsibleEmployee = resolveEmployee(request.getResponsibleEmployeeId());

                List<ProductToolPreparationItem> itemsToCreate = buildItems(product, processType, request,
                                responsibleEmployee);
                if (itemsToCreate.isEmpty()) {
                        throw new IllegalArgumentException("Vui lòng nhập ít nhất một dụng cụ");
                }

                toolPreparationItemRepository.saveAll(itemsToCreate);

                return mapGroupToDTO(
                                toolPreparationItemRepository.findActiveByProductIdAndProcessType(product.getId(),
                                                processType));
        }

        @Override
        @Transactional
        public ProductToolPreparationDTO updateToolPreparation(Long id, ProductToolPreparationRequest request) {
                ProductToolPreparationItem item = findItemOrThrow(id);

                if (request.getProcessType() != null) {
                        item.setProcessType(request.getProcessType());
                }

                ProductToolPreparationItemRequest payloadItem = request.getItems() != null
                                && !request.getItems().isEmpty()
                                                ? request.getItems().get(0)
                                                : null;

                LocalDateTime assignedDate = request.getAssignedDate();
                LocalDateTime completionDate = request.getActualCompletionDate() != null
                                ? request.getActualCompletionDate()
                                : request.getExpectedCompletionDate();

                if (payloadItem != null) {
                        if (payloadItem.getToolName() != null && !payloadItem.getToolName().trim().isEmpty()) {
                                item.setToolName(payloadItem.getToolName().trim());
                        }
                        item.setQuantityRequired(payloadItem.getQuantityRequired());
                        item.setQuantityAvailable(payloadItem.getQuantityAvailable());
                        item.setNote(payloadItem.getNote());

                        if (payloadItem.getCompletionDate() != null) {
                                completionDate = payloadItem.getCompletionDate();
                        }
                }

                ToolPreparationStatus itemStatus = deriveStatusFromDates(assignedDate, completionDate);
                item.setStatus(itemStatus);
                item.setCompletionDate(completionDate);
                item.setResponsibleEmployee(resolveEmployee(request.getResponsibleEmployeeId()));
                item.setAssignedDate(assignedDate);
                item.setExpectedCompletionDate(completionDate);
                item.setActualCompletionDate(completionDate);
                item.setRemark(request.getRemark());

                toolPreparationItemRepository.save(item);
                return mapGroupToDTO(List.of(item));
        }

        @Override
        public List<ProductToolPreparationDTO> getToolPreparationsByProduct(Long productId) {
                return groupItems(toolPreparationItemRepository.findActiveByProductId(productId));
        }

        @Override
        public ProductToolPreparationDTO getToolPreparationById(Long id) {
                return mapGroupToDTO(List.of(findItemOrThrow(id)));
        }

        @Override
        @Transactional
        public void deleteToolPreparation(Long id) {
                ProductToolPreparationItem item = findItemOrThrow(id);
                item.setDeletedAt(LocalDateTime.now());
                toolPreparationItemRepository.save(item);
        }

        @Override
        @Transactional
        public void updateStatus(Long id, ToolPreparationStatus status) {
                ProductToolPreparationItem item = findItemOrThrow(id);
                item.setStatus(status);

                if (status == ToolPreparationStatus.COMPLETED) {
                        LocalDateTime now = LocalDateTime.now();
                        if (item.getCompletionDate() == null) {
                                item.setCompletionDate(now);
                        }
                        if (item.getActualCompletionDate() == null) {
                                item.setActualCompletionDate(now);
                        }
                }

                toolPreparationItemRepository.save(item);
        }

        @Override
        public boolean areAllToolsReady(Long productId) {
                long totalItems = toolPreparationItemRepository.countActiveByProductId(productId);
                long incompleteItems = toolPreparationItemRepository.countIncompleteByProductId(productId);
                return totalItems > 0 && incompleteItems == 0;
        }

        @Override
        public List<ProductToolPreparationDTO> getToolPreparationsByEmployee(Long employeeId) {
                return groupItems(toolPreparationItemRepository.findActiveByResponsibleEmployeeId(employeeId));
        }

        private Product getProductOrThrow(Long productId) {
                return productRepository.findById(productId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));
        }

        private ProductToolPreparationItem findItemOrThrow(Long id) {
                return toolPreparationItemRepository.findActiveById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dụng cụ chuẩn bị"));
        }

        private ToolPreparationType requireProcessType(ToolPreparationType processType) {
                if (processType == null) {
                        throw new IllegalArgumentException("Vui lòng chọn quy trình");
                }
                return processType;
        }

        private Employee resolveEmployee(Long employeeId) {
                Long currentEmployeeId = SecurityUtils.getCurrentEmployeeId();
                if (currentEmployeeId != null) {
                        return employeeRepository.findById(currentEmployeeId).orElse(null);
                }
                if (employeeId == null) {
                        return null;
                }
                return employeeRepository.findById(employeeId).orElse(null);
        }

        private List<ProductToolPreparationItem> buildItems(Product product,
                        ToolPreparationType processType,
                        ProductToolPreparationRequest request,
                        Employee responsibleEmployee) {
                if (request.getItems() == null) {
                        return new ArrayList<>();
                }

                return request.getItems().stream()
                                .filter(item -> item != null && item.getToolName() != null
                                                && !item.getToolName().trim().isEmpty())
                                .map(item -> buildSingleItem(product, processType, request, item, responsibleEmployee))
                                .collect(Collectors.toList());
        }

        private ProductToolPreparationItem buildSingleItem(Product product,
                        ToolPreparationType processType,
                        ProductToolPreparationRequest request,
                        ProductToolPreparationItemRequest itemRequest,
                        Employee responsibleEmployee) {
                LocalDateTime assignedDate = request.getAssignedDate();
                LocalDateTime completionDate = itemRequest.getCompletionDate() != null
                                ? itemRequest.getCompletionDate()
                                : (request.getActualCompletionDate() != null ? request.getActualCompletionDate()
                                                : request.getExpectedCompletionDate());

                ToolPreparationStatus itemStatus = deriveStatusFromDates(assignedDate, completionDate);

                return ProductToolPreparationItem.builder()
                                .product(product)
                                .processType(processType)
                                .toolName(itemRequest.getToolName().trim())
                                .quantityRequired(itemRequest.getQuantityRequired())
                                .quantityAvailable(itemRequest.getQuantityAvailable())
                                .status(itemStatus)
                                .responsibleEmployee(responsibleEmployee)
                                .assignedDate(assignedDate)
                                .expectedCompletionDate(completionDate)
                                .actualCompletionDate(completionDate)
                                .completionDate(completionDate)
                                .remark(request.getRemark())
                                .note(itemRequest.getNote())
                                .build();
        }

        private ToolPreparationStatus deriveStatusFromDates(LocalDateTime assignedDate, LocalDateTime completionDate) {
                if (completionDate != null && assignedDate == null) {
                        throw new IllegalArgumentException("Nếu có ngày hoàn thành thì phải có ngày bắt đầu");
                }
                if (assignedDate == null) {
                        return ToolPreparationStatus.NOT_STARTED;
                }
                if (completionDate != null) {
                        return ToolPreparationStatus.COMPLETED;
                }
                return ToolPreparationStatus.IN_PROGRESS;
        }

        private List<ProductToolPreparationDTO> groupItems(List<ProductToolPreparationItem> items) {
                if (items == null || items.isEmpty()) {
                        return new ArrayList<>();
                }

                return items.stream()
                                .map(item -> mapGroupToDTO(List.of(item)))
                                .collect(Collectors.toList());
        }

        private ProductToolPreparationDTO mapGroupToDTO(List<ProductToolPreparationItem> items) {
                if (items == null || items.isEmpty()) {
                        throw new ResourceNotFoundException("Không tìm thấy dữ liệu chuẩn bị dụng cụ");
                }

                ProductToolPreparationItem first = items.get(0);
                List<ProductToolPreparationItemDTO> itemDTOs = items.stream()
                                .map(this::mapItemToDTO)
                                .collect(Collectors.toList());

                LocalDateTime actualCompletionDate = items.stream()
                                .map(item -> item.getActualCompletionDate() != null ? item.getActualCompletionDate()
                                                : item.getCompletionDate())
                                .filter(value -> value != null)
                                .max(LocalDateTime::compareTo)
                                .orElse(null);

                return ProductToolPreparationDTO.builder()
                                .id(first.getId())
                                .productId(first.getProduct().getId())
                                .productCode(first.getProduct().getCode())
                                .productName(first.getProduct().getName())
                                .processType(first.getProcessType())
                                .processName(getProcessName(first.getProcessType()))
                                .status(resolveOverallStatusFromItems(items))
                                .responsibleEmployeeId(first.getResponsibleEmployee() != null
                                                ? first.getResponsibleEmployee().getId()
                                                : null)
                                .responsibleEmployeeName(first.getResponsibleEmployee() != null
                                                ? first.getResponsibleEmployee().getName()
                                                : null)
                                .responsibleEmployeeCode(first.getResponsibleEmployee() != null
                                                ? first.getResponsibleEmployee().getCode()
                                                : null)
                                .assignedDate(first.getAssignedDate())
                                .expectedCompletionDate(first.getExpectedCompletionDate())
                                .actualCompletionDate(actualCompletionDate)
                                .remark(first.getRemark())
                                .items(itemDTOs)
                                .createdAt(first.getCreatedAt())
                                .createdBy(first.getCreatedBy())
                                .updatedAt(first.getUpdatedAt())
                                .updatedBy(first.getUpdatedBy())
                                .build();
        }

        private String getProcessName(ToolPreparationType processType) {
                return processType != null ? processType.getCode() : null;
        }

        private ToolPreparationStatus resolveOverallStatusFromItems(List<ProductToolPreparationItem> items) {
                if (items == null || items.isEmpty()) {
                        return ToolPreparationStatus.NOT_STARTED;
                }

                boolean allCompleted = items.stream()
                                .allMatch(item -> item.getStatus() == ToolPreparationStatus.COMPLETED);
                if (allCompleted) {
                        return ToolPreparationStatus.COMPLETED;
                }

                boolean anyInProgress = items.stream()
                                .anyMatch(item -> item.getStatus() == ToolPreparationStatus.IN_PROGRESS
                                                || item.getStatus() == ToolPreparationStatus.COMPLETED);

                return anyInProgress ? ToolPreparationStatus.IN_PROGRESS : ToolPreparationStatus.NOT_STARTED;
        }

        private ProductToolPreparationItemDTO mapItemToDTO(ProductToolPreparationItem entity) {
                return ProductToolPreparationItemDTO.builder()
                                .id(entity.getId())
                                .productId(entity.getProduct() != null ? entity.getProduct().getId() : null)
                                .processType(entity.getProcessType())
                                .toolName(entity.getToolName())
                                .quantityRequired(entity.getQuantityRequired())
                                .quantityAvailable(entity.getQuantityAvailable())
                                .status(entity.getStatus())
                                .responsibleEmployeeId(entity.getResponsibleEmployee() != null
                                                ? entity.getResponsibleEmployee().getId()
                                                : null)
                                .responsibleEmployeeName(entity.getResponsibleEmployee() != null
                                                ? entity.getResponsibleEmployee().getName()
                                                : null)
                                .responsibleEmployeeCode(entity.getResponsibleEmployee() != null
                                                ? entity.getResponsibleEmployee().getCode()
                                                : null)
                                .assignedDate(entity.getAssignedDate())
                                .expectedCompletionDate(entity.getExpectedCompletionDate())
                                .actualCompletionDate(entity.getActualCompletionDate())
                                .completionDate(entity.getCompletionDate())
                                .remark(entity.getRemark())
                                .note(entity.getNote())
                                .build();
        }
}
