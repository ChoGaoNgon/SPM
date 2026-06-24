package htmp.codien.quanlycodien.modules.attendance.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.attendance.dto.CurrentWorkingEmployeeDTO;
import htmp.codien.quanlycodien.modules.attendance.entity.Attendance;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByEmployeeIdAndWorkDate(Long employeeId, LocalDate workDate);

    @Query(value = """
            SELECT
                e.id AS employeeId,
                e.code AS employeeCode,
                e.name AS employeeName,
                p.name AS positionName,
                d.name AS departmentName
            FROM employees e
            JOIN position p ON p.id = e.position_id
            JOIN departments d ON d.id = e.department_id
            LEFT JOIN attendance a ON e.id = a.employee_id
            WHERE
                (
                    (a.work_date = :workDate
                    AND a.checkin_time IS NOT NULL
                    AND a.checkout_time IS NULL)
                )
                OR p.code IN ('TRP', 'PP')
            """, nativeQuery = true)
    List<CurrentWorkingEmployeeDTO> findCurrentlyWorkingEmployees(@Param("workDate") LocalDate workDate);
}