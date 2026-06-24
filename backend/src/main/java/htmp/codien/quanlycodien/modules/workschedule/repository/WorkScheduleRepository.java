package htmp.codien.quanlycodien.modules.workschedule.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.workschedule.entity.WorkSchedule;

public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, Long> {

  @Query(value = """
          SELECT e.id, e.name, e.code, ws.work_date, ws.shift_id, s.shift_code, s.code_hcns
          FROM work_schedules ws
          JOIN employees e ON ws.employee_id = e.id
          JOIN shifts s ON s.id = ws.shift_id
          WHERE e.department_id = :departmentId
            AND ws.work_date BETWEEN :startDate AND :endDate
      """, nativeQuery = true)
  List<Object[]> findWorkSchedulesByDepartmentAndDate(
      @Param("departmentId") Long departmentId,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate);

  @Query(value = """
      SELECT e.id, e.name, e.code, ws.work_date, ws.shift_id, s.shift_code, a.checkin_time, a.checkout_time,
      CASE
                  WHEN a.checkin_time IS NULL THEN 0
                  WHEN TIME(a.checkin_time) >= DATE_SUB(s.start_time, INTERVAL 4 MINUTE) THEN 1
                  ELSE 0
          END AS is_late,

          CASE
                  WHEN a.checkout_time IS NULL THEN 0
                  WHEN TIME(a.checkout_time) <= DATE_ADD(s.end_time, INTERVAL 4 MINUTE) THEN 1
                  ELSE 0
          END AS is_early
      FROM work_schedules ws
      JOIN employees e ON ws.employee_id = e.id
      JOIN shifts s ON s.id = ws.shift_id
      LEFT join attendance a ON (ws.work_date = a.work_date and e.id = a.employee_id )
      WHERE ws.employee_id = :employeeId
      AND ws.work_date BETWEEN :startDate AND :endDate
           """, nativeQuery = true)
  List<Object[]> findWorkSchedulesByEmployeeAndDate(
      @Param("employeeId") Long employeeId,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate);

  @Query(value = """
      SELECT s.start_time, s.end_time, s.id, shift_code, ws.created_at
      FROM work_schedules ws
      JOIN shifts s ON ws.shift_id = s.id
      WHERE ws.work_date = :workDate
        AND ws.employee_id = :employeeId
      """, nativeQuery = true)
  List<Object[]> findShiftTimesByEmployeeAndDate(
      @Param("employeeId") Long employeeId,
      @Param("workDate") LocalDate workDate);

  void deleteByWorkDateBetweenAndEmployee_Department_Id(LocalDate start, LocalDate end, Long currentDepartmentId);

  @Query(value = """
      SELECT ws.work_date AS workDate, s.shift_code AS shiftCode
      FROM work_schedules ws
      JOIN shifts s ON ws.shift_id = s.id
      WHERE ws.employee_id = :employeeId
      AND ws.work_date = :workDate
      LIMIT 1
      """, nativeQuery = true)
  Object findByWorkDateNative(
      @Param("employeeId") Long employeeId,
      @Param("workDate") LocalDate workDate);

  Optional<WorkSchedule> findByEmployeeAndWorkDate(Employee employee, LocalDate date);

  Optional<WorkSchedule> findByEmployeeIdAndWorkDate(Long id, LocalDate workDate);

  @Query(value = """
      SELECT e.id AS employee_id,
             e.name AS employee_name,
             e.code AS employee_code,
             ws.work_date,
             ws.shift_id,
             s.shift_code,
             s.code_hcns
      FROM work_schedules ws
      JOIN employees e ON ws.employee_id = e.id
      JOIN shifts s ON s.id = ws.shift_id
      WHERE e.department_id IN (:allDepartmentIds)
        AND ws.work_date BETWEEN :startDate AND :endDate
      ORDER BY e.id, ws.work_date
      """, nativeQuery = true)
  List<Object[]> findWorkSchedulesByDepartmentsAndDateRange(
      @Param("allDepartmentIds") List<Long> allDepartmentIds,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate);

  Optional<WorkSchedule> findByEmployee_IdAndWorkDate(Long id, LocalDate workDate);

  List<WorkSchedule> findByEmployeeIdInAndWorkDateBetween(
      List<Long> employeeIds,
      LocalDate startDate,
      LocalDate endDate);
}
