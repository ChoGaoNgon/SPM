package htmp.codien.quanlycodien.modules.department.service;

import java.util.List;

import org.springframework.stereotype.Service;

import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.modules.department.dto.DepartmentRequest;
import htmp.codien.quanlycodien.modules.department.dto.DepartmentRootDTO;
import htmp.codien.quanlycodien.modules.department.entity.Department;
import htmp.codien.quanlycodien.modules.department.repository.DepartmentRepository;
import htmp.codien.quanlycodien.modules.employee.enums.EmployeeStatus;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {
    private final DepartmentRepository departmentRepository;

    @Override
    public Department getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return department;
    }

    @Override
    public List<DepartmentRootDTO> getRootDepartments() {
        List<Department> rootDepartments = departmentRepository.findByParentDepartmentIsNullOrderByNameAsc();
        if (rootDepartments.isEmpty()) {
            throw new ResourceNotFoundException("Không có phòng ban nào được tìm thấy");
        }

        return rootDepartments.stream()
                .map(department -> DepartmentRootDTO.builder()
                        .id(department.getId())
                        .code(department.getCode())
                        .name(department.getName())
                        .subDepartmentCount(department.getSubDepartments().size())
                        .employeeCount(
                                (int) department.getEmployees().stream()
                                        .filter(emp -> emp.getStatus() != EmployeeStatus.INACTIVE)
                                        .count()
                                        + department.getSubDepartments().stream()
                                                .mapToInt(sub -> (int) sub.getEmployees().stream()
                                                        .filter(emp -> emp.getStatus() != EmployeeStatus.INACTIVE)
                                                        .count())
                                                .sum())
                        .subDepartments(
                                department.getSubDepartments().stream()
                                        .map(sub -> DepartmentRootDTO.DepartmentSubDTO.builder()
                                                .id(sub.getId())
                                                .code(sub.getCode())
                                                .name(sub.getName())
                                                .employeeCount(
                                                        (int) sub.getEmployees().stream()
                                                                .filter(emp -> emp
                                                                        .getStatus() != EmployeeStatus.INACTIVE)
                                                                .count())
                                                .build())
                                        .toList())
                        .build())
                .toList();
    }

    @Override
    public List<Department> getSubDepartments(Long parentId) {
        List<Department> subDepartments = departmentRepository
                .findByParentDepartmentOrderByNameAsc(getDepartmentById(parentId));
        if (subDepartments.isEmpty()) {
            throw new ResourceNotFoundException("Phòng ban không có nhóm hoặc bộ phận");
        }
        return subDepartments;
    }

    @Override
    public void createDepartment(DepartmentRequest request) {
        Department department = new Department();
        department.setName(request.getName());
        department.setCode(request.getCode());

        if (request.getParentDepartmentId() != null) {
            Department parentDepartment = getDepartmentById(request.getParentDepartmentId());
            department.setParentDepartment(parentDepartment);
        }

        departmentRepository.save(department);
    }

    @Override
    public void updateDepartment(Long id, DepartmentRequest request) {
        Department existingDepartment = getDepartmentById(id);
        existingDepartment.setName(request.getName());
        existingDepartment.setCode(request.getCode());

        if (request.getParentDepartmentId() != null) {
            Department parentDepartment = getDepartmentById(request.getParentDepartmentId());
            existingDepartment.setParentDepartment(parentDepartment);
        } else {
            existingDepartment.setParentDepartment(null);
        }

        departmentRepository.save(existingDepartment);
    }

    @Override
    public void deleteDepartment(Long id) {
        Department department = getDepartmentById(id);
        if (!department.getSubDepartments().isEmpty()) {
            throw new IllegalArgumentException("Không thể xóa phòng ban có đã có nhóm / bộ phận");
        }
        departmentRepository.delete(department);
    }

}
