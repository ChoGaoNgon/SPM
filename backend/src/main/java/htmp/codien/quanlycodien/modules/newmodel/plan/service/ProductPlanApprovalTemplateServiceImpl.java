package htmp.codien.quanlycodien.modules.newmodel.plan.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.common.exception.ConflictException;
import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.ProductPlanApprovalTemplateDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanApprovalTemplateRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanApprovalTemplate;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanApprovalTemplateRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductPlanApprovalTemplateServiceImpl implements ProductPlanApprovalTemplateService {

    private final ProductPlanApprovalTemplateRepository templateRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductPlanApprovalTemplateDTO> getAllTemplates() {
        return templateRepository.findAllByOrderByApprovalOrderAsc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductPlanApprovalTemplateDTO getTemplateById(Long id) {
        ProductPlanApprovalTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template không tồn tại"));
        return convertToDTO(template);
    }

    @Override
    public ProductPlanApprovalTemplateDTO createTemplate(ProductPlanApprovalTemplateRequest request) {

        if (templateRepository.findByApprovalTypeAndApprovalOrder(
                request.getApprovalType(), request.getApprovalOrder()).isPresent()) {
            throw new ConflictException("Template với loại và thứ tự này đã tồn tại");
        }

        ProductPlanApprovalTemplate template = ProductPlanApprovalTemplate.builder()
                .approvalType(request.getApprovalType())
                .approvalTypeName(request.getApprovalTypeName())
                .approvalOrder(request.getApprovalOrder())
                .required(request.getRequired())
                .requiredPermission(request.getRequiredPermission())
                .build();

        template = templateRepository.save(template);
        return convertToDTO(template);
    }

    @Override
    public ProductPlanApprovalTemplateDTO updateTemplate(Long id, ProductPlanApprovalTemplateRequest request) {
        ProductPlanApprovalTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template không tồn tại"));

        if (!template.getApprovalType().equals(request.getApprovalType())
                || !template.getApprovalOrder().equals(request.getApprovalOrder())) {
            templateRepository.findByApprovalTypeAndApprovalOrder(
                    request.getApprovalType(), request.getApprovalOrder())
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(id)) {
                            throw new ConflictException("Template với loại và thứ tự này đã tồn tại");
                        }
                    });
        }

        template.setApprovalType(request.getApprovalType());
        template.setApprovalTypeName(request.getApprovalTypeName());
        template.setApprovalOrder(request.getApprovalOrder());
        template.setRequired(request.getRequired());
        template.setRequiredPermission(request.getRequiredPermission());

        template = templateRepository.save(template);
        return convertToDTO(template);
    }

    @Override
    public void deleteTemplate(Long id) {
        if (!templateRepository.existsById(id)) {
            throw new ResourceNotFoundException("Template không tồn tại");
        }
        templateRepository.deleteById(id);
    }

    @Override
    public void reorderTemplates(List<Long> templateIds) {
        for (int i = 0; i < templateIds.size(); i++) {
            Long templateId = templateIds.get(i);
            ProductPlanApprovalTemplate template = templateRepository.findById(templateId)
                    .orElseThrow(() -> new ResourceNotFoundException("Template không tồn tại: " + templateId));
            template.setApprovalOrder(i + 1);
            templateRepository.save(template);
        }
    }

    private ProductPlanApprovalTemplateDTO convertToDTO(ProductPlanApprovalTemplate template) {
        return ProductPlanApprovalTemplateDTO.builder()
                .id(template.getId())
                .approvalType(template.getApprovalType())
                .approvalTypeName(template.getApprovalTypeName())
                .approvalOrder(template.getApprovalOrder())
                .required(template.getRequired())
                .requiredPermission(template.getRequiredPermission())
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .createdBy(template.getCreatedBy())
                .updatedBy(template.getUpdatedBy())
                .build();
    }
}
