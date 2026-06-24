package htmp.codien.quanlycodien.modules.department.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.department.entity.Department;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByParentDepartmentIsNullOrderByNameAsc();

    List<Department> findByParentDepartmentOrderByNameAsc(Department parentDepartment);

    @Query(value = """
            WITH RECURSIVE sub_departments AS (
                SELECT d.id
                FROM departments d
                WHERE d.id = :departmentId  -- phòng cha

                UNION ALL

                SELECT child.id
                FROM departments child
                JOIN sub_departments sd ON child.parent_department_id = sd.id
            )
            SELECT id FROM sub_departments
            """, nativeQuery = true)
    List<Long> findDepartmentAndAllSubDepartmentIds(@Param("departmentId") Long departmentId);

    Optional<Department> findByCode(String departmentCode);

    Optional<Department> findByName(String name);

    Department findById(long id);

    @Query(value = """
                SELECT prd.*
                FROM departments d
                JOIN departments prd ON d.parent_department_id = prd.id
                WHERE d.code = :departmentCode
            """, nativeQuery = true)
    Department findParentByDepartmentCode(@Param("departmentCode") String departmentCode);
}