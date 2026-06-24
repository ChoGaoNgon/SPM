package htmp.codien.quanlycodien.modules.newmodel.plan.service;

import java.util.List;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanApproveResultDepartmentDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanApproveResultDepartmentRequest;

public interface ProductPlanApproveResultDepartmentService {

    void createApproveResultDepartment(ProductPlanApproveResultDepartmentRequest request);

    List<ProductPlanApproveResultDepartmentDTO> getAllApproveResultDepartments();

    ProductPlanApproveResultDepartmentDTO getApproveResultDepartmentById(Long id);

    void updateApproveResultDepartment(Long id, ProductPlanApproveResultDepartmentRequest request);

    void deleteApproveResultDepartment(Long id);

    void createTemplateApproveResultDepartments();

}
