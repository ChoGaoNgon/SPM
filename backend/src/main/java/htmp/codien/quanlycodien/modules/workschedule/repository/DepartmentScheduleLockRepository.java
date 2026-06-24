package htmp.codien.quanlycodien.modules.workschedule.repository;

import htmp.codien.quanlycodien.modules.department.entity.Department;
import htmp.codien.quanlycodien.modules.workschedule.entity.DepartmentScheduleLock;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentScheduleLockRepository extends JpaRepository<DepartmentScheduleLock, Long> {
    Optional<DepartmentScheduleLock> findByDepartmentAndYearAndMonth(Department department, Integer year,
            Integer month);
}