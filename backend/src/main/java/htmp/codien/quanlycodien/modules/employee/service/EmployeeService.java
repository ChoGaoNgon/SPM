package htmp.codien.quanlycodien.modules.employee.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.modules.employee.dto.EmployeeRequest;
import htmp.codien.quanlycodien.modules.employee.dto.EmployeeResponse;
import htmp.codien.quanlycodien.modules.employee.dto.EmployeeSearchRequest;
import htmp.codien.quanlycodien.modules.employee.dto.EmployeeStatsResponse;

public interface EmployeeService {
    List<EmployeeResponse> findAll();

    List<EmployeeResponse> findByDepartment(Long departmentId);

    EmployeeResponse getEmployeeByCode(String code);

    Optional<EmployeeResponse> findById(Long id);

    void save(EmployeeRequest request);

    void importEmployeeFromExcel(MultipartFile file);

    List<EmployeeResponse> findByDepartmentCode(String departmentCode);

    void syncEmployeeData();

    EmployeeStatsResponse getEmployeeStats();

    List<EmployeeResponse> searchEmployees(EmployeeSearchRequest searchRequest);

    Page<EmployeeResponse> searchEmployeesWithPagination(EmployeeSearchRequest searchRequest, Pageable pageable);

    void updateRole(Long id, htmp.codien.quanlycodien.common.enums.Role role);

    void resetPassword(Long id);

    EmployeeResponse getMe();

    EmployeeResponse toResponse(htmp.codien.quanlycodien.modules.employee.entity.Employee employee);
}
