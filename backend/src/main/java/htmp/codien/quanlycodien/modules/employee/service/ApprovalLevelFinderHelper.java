package htmp.codien.quanlycodien.modules.employee.service;

import java.util.List;

import org.springframework.stereotype.Component;

import htmp.codien.quanlycodien.common.enums.ApprovalLevel;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ApprovalLevelFinderHelper {

    private final EmployeeRepository employeeRepository;

    public List<Employee> findLevel1Managers(Long employeeId) {
        return employeeRepository.findLevel1Managers(
                employeeId,
                List.of("NVHTQL", "NVCC", "GS", "GSCC", "TC"));
    }

    public List<String> findLevel1ManagersToString(Long employeeId) {
        List<Employee> managers = findLevel1Managers(employeeId);
        return managers.stream()
                .map(Employee::getId)
                .map(String::valueOf)
                .toList();
    }

    public List<Employee> findLevel2DepartmentHeads(Long employeeId) {
        return employeeRepository.findLevel2DepartmentHeads(
                employeeId,
                List.of("TRP", "PP"));
    }

    public List<String> findLevel2DepartmentHeadsToString(Long employeeId) {
        List<Employee> heads = findLevel2DepartmentHeads(employeeId);
        return heads.stream()
                .map(Employee::getId)
                .map(String::valueOf)
                .toList();
    }

    public List<String> findManagersByLevel(Long employeeId, ApprovalLevel level) {
        return switch (level) {
            case LEVEL1 -> findLevel1ManagersToString(employeeId);
            case LEVEL2 -> findLevel2DepartmentHeadsToString(employeeId);
            default -> List.of();
        };
    }

}
