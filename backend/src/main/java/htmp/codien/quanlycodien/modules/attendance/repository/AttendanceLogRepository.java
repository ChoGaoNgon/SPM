package htmp.codien.quanlycodien.modules.attendance.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.attendance.entity.AttendanceLog;

public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, Long> {

  @Query(value = """
      SELECT DISTINCT e.id
      FROM attendance_logs al
      JOIN employees e ON e.machine_employee_id = al.machine_employee_id
      WHERE al.log_time BETWEEN :start AND :end
        AND e.status IN ('ACTIVE', 'PROBATION')
      """, nativeQuery = true)
  List<Long> findDistinctActiveEmployeeIdsByDate(
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end);

  @Query(value = """
      SELECT al.*
      FROM attendance_logs al
      JOIN employees e ON e.machine_employee_id = al.machine_employee_id
       WHERE al.log_time BETWEEN :start AND :end
      AND e.status IN ('ACTIVE', 'PROBATION') and e.id = :employeeId
      """, nativeQuery = true)
  List<AttendanceLog> findByEmployeeIdAndLogTimeBetween(
      Long employeeId,
      LocalDateTime start,
      LocalDateTime end);

  @Query("""
      SELECT al FROM AttendanceLog al
      LEFT JOIN Employee e ON e.machineEmployeeId = al.machineEmployeeId
      WHERE (:employeeId IS NULL OR e.id = :employeeId)
      AND (:startDate IS NULL OR al.logTime >= :startDate)
      AND (:endDate IS NULL OR al.logTime <= :endDate)
      ORDER BY al.logTime DESC
      """)
  Page<AttendanceLog> findRawLogsWithFilters(
      @Param("employeeId") Long employeeId,
      @Param("startDate") LocalDateTime startDate,
      @Param("endDate") LocalDateTime endDate,
      Pageable pageable);
}
