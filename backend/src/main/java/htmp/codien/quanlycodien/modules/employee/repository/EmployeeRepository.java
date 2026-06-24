package htmp.codien.quanlycodien.modules.employee.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.employee.enums.*;
import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.modules.department.entity.Department;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {
    @EntityGraph(attributePaths = "department")
    Optional<Employee> findByCode(String code);

    @EntityGraph(attributePaths = "department")
    Optional<Employee> findByMachineEmployeeId(Long machineEmployeeId);

    List<Employee> findByDepartment(Department department);

    List<Employee> findByDepartment_Id(Long departmentId);

    List<Employee> findByDepartment_Code(String code);

    List<Employee> findByCodeIn(List<String> codes);

    List<Employee> findByDepartment_IdAndStatusIn(Long departmentId, List<EmployeeStatus> statuses);

    @Query("SELECT e FROM Employee e WHERE e.department.code IN :departmentCodes AND e.status IN :statuses")
    List<Employee> findByDepartmentCodesAndStatuses(
            @Param("departmentCodes") List<String> departmentCodes,
            @Param("statuses") List<EmployeeStatus> statuses);

    @Query(value = """
            WITH RECURSIVE sub_departments AS (
                SELECT d.id, d.parent_department_id
                FROM departments d
                WHERE d.id = :departmentId

                UNION ALL

                SELECT child.id, child.parent_department_id
                FROM departments child
                INNER JOIN sub_departments sd ON child.parent_department_id = sd.id
            )
            SELECT e.*
            FROM employees e
            JOIN sub_departments sd ON e.department_id = sd.id
            """, nativeQuery = true)
    List<Employee> findEmployeesInDepartmentAndSubDepartments(@Param("departmentId") Long departmentId);

    List<Employee> findByRole(Role role);

    List<Employee> findByStatusIn(List<EmployeeStatus> statuses);

    @Query(value = """
                SELECT e.*
                FROM employees e
                JOIN position p ON e.position_id = p.id
                WHERE e.department_id = (
                    SELECT department_id FROM employees WHERE id = :employeeId
                )
                AND p.code IN (:positionCodes)
            """, nativeQuery = true)
    List<Employee> findLevel1Managers(
            @Param("employeeId") Long employeeId,
            @Param("positionCodes") List<String> positionCodes);

    @Query(value = """
                SELECT e.*
                FROM employees e
                JOIN position p ON e.position_id = p.id
                JOIN departments d ON e.department_id = d.id
                WHERE d.id = (
                    SELECT COALESCE(d2.parent_department_id, d2.id)
                    FROM employees e2
                    JOIN departments d2 ON e2.department_id = d2.id
                    WHERE e2.id = :employeeId
                )
                AND p.code IN (:positionCodes)
            """, nativeQuery = true)
    List<Employee> findLevel2DepartmentHeads(
            @Param("employeeId") Long employeeId,
            @Param("positionCodes") List<String> positionCodes);

    @Query(value = """
                SELECT e.*
                FROM employees e
                WHERE (
                    EXISTS (
                        SELECT 1
                        FROM role_permissions rp
                        JOIN permissions p ON p.id = rp.permission_id
                        WHERE rp.role_name = e.role
                          AND p.code = :code
                    )
                    AND NOT EXISTS (
                        SELECT 1
                        FROM employee_permissions ep2
                        JOIN permissions p2 ON p2.id = ep2.permission_id
                        WHERE ep2.employee_id = e.id
                          AND p2.code = :code
                          AND ep2.is_granted = false
                    )
                )
                OR EXISTS (
                    SELECT 1
                    FROM employee_permissions ep3
                    JOIN permissions p3 ON p3.id = ep3.permission_id
                    WHERE ep3.employee_id = e.id
                      AND p3.code = :code
                      AND ep3.is_granted = true
                )
            """, nativeQuery = true)
    List<Employee> findEmployeesByPermissionCode(@Param("code") String code);

}
