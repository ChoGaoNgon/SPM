package htmp.codien.quanlycodien.modules.department.service;

import java.util.List;

import htmp.codien.quanlycodien.modules.department.dto.DepartmentRequest;
import htmp.codien.quanlycodien.modules.department.dto.DepartmentRootDTO;
import htmp.codien.quanlycodien.modules.department.entity.Department;

public interface DepartmentService {
    Department getDepartmentById(Long id);

    List<DepartmentRootDTO> getRootDepartments();

    List<Department> getSubDepartments(Long parentId);

    void createDepartment(DepartmentRequest department);

    void updateDepartment(Long id, DepartmentRequest department);

    void deleteDepartment(Long id);
}