package htmp.codien.quanlycodien.modules.newmodel.plan.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanApproveResultDepartmentDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanApproveResultDepartmentRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanApproveResultDepartment;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanApproveResultDepartmentRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductPlanApproveResultDepartmentServiceImpl
        implements ProductPlanApproveResultDepartmentService {

    private final ProductPlanApproveResultDepartmentRepository repository;

    @Override
    public void createApproveResultDepartment(ProductPlanApproveResultDepartmentRequest request) {
        ProductPlanApproveResultDepartment entity = ProductPlanApproveResultDepartment.builder()
                .departmentCode(request.getDepartmentCode())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        repository.save(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductPlanApproveResultDepartmentDTO> getAllApproveResultDepartments() {
        return repository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductPlanApproveResultDepartmentDTO getApproveResultDepartmentById(Long id) {
        ProductPlanApproveResultDepartment entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ban phê duyệt với ID: " + id));

        return convertToDTO(entity);
    }

    @Override
    public void updateApproveResultDepartment(Long id, ProductPlanApproveResultDepartmentRequest request) {
        ProductPlanApproveResultDepartment entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ban phê duyệt với ID: " + id));

        entity.setDepartmentCode(request.getDepartmentCode());
        entity.setIsActive(request.getIsActive());

        repository.save(entity);
    }

    @Override
    public void deleteApproveResultDepartment(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy phòng ban phê duyệt với ID: " + id);
        }

        repository.deleteById(id);
    }

    @Override
    public void createTemplateApproveResultDepartments() {

        String[] defaultDepartments = { "KT", "QC", "SX", "P-NMD", "MOLD" };

        for (String deptCode : defaultDepartments) {
            ProductPlanApproveResultDepartment entity = ProductPlanApproveResultDepartment.builder()
                    .departmentCode(deptCode)
                    .isActive(true)
                    .build();

            repository.save(entity);
        }
    }

    private ProductPlanApproveResultDepartmentDTO convertToDTO(
            ProductPlanApproveResultDepartment entity) {
        return ProductPlanApproveResultDepartmentDTO.builder()
                .id(entity.getId())
                .departmentCode(entity.getDepartmentCode())
                .isActive(entity.getIsActive())
                .build();
    }
}