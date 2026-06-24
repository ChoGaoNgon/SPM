package htmp.codien.quanlycodien.modules.workreport.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.workreport.entity.DailyWorkReport;

@Repository
public interface DailyWorkReportRepository extends JpaRepository<DailyWorkReport, Long> {

  @Query(value = """
      SELECT dwr.*
      FROM daily_work_reports dwr
      JOIN employees e ON dwr.employee_id = e.id
      JOIN departments d ON e.department_id = d.id
      LEFT JOIN departments parent_d ON d.parent_department_id = parent_d.id
      WHERE (parent_d.id = :departmentId OR d.id = :departmentId)
        AND (
          (dwr.start_datetime BETWEEN :startDateTime AND :endDateTime)
          OR (dwr.end_datetime BETWEEN :startDateTime AND :endDateTime)
        )
      """, nativeQuery = true)
  List<DailyWorkReport> findReportsByDepartmentAndTimeRange(
      @Param("departmentId") Long departmentId,
      @Param("startDateTime") LocalDateTime startDateTime,
      @Param("endDateTime") LocalDateTime endDateTime);

  @Query(value = """
      SELECT dwr.*
      FROM daily_work_reports dwr
      WHERE dwr.employee_id = :employeeId
        AND (
          (dwr.start_datetime BETWEEN :startDateTime AND :endDateTime)
          OR (dwr.end_datetime BETWEEN :startDateTime AND :endDateTime)
        )
      """, nativeQuery = true)
  List<DailyWorkReport> findReportsByEmployeeAndTimeRange(
      @Param("employeeId") Long employeeId,
      @Param("startDateTime") LocalDateTime startDateTime,
      @Param("endDateTime") LocalDateTime endDateTime);

  @Query(value = """
      SELECT DISTINCT e.*
      FROM employees e
      JOIN daily_work_reports dwr ON e.id = dwr.employee_id
      WHERE (
        (dwr.start_datetime BETWEEN :startDateTime AND :endDateTime)
        OR (dwr.end_datetime BETWEEN :startDateTime AND :endDateTime)
      )
      """, nativeQuery = true)
  List<Employee> findEmployeesWithReportsInTimeRange(
      @Param("startDateTime") LocalDateTime startDateTime,
      @Param("endDateTime") LocalDateTime endDateTime);
}
