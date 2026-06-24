package htmp.codien.quanlycodien.modules.workschedule.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.workschedule.entity.OvertimeRequest;
import htmp.codien.quanlycodien.modules.workschedule.enums.WorkRequestStatus;

@Repository
public interface OvertimeRequestRepository extends JpaRepository<OvertimeRequest, Long> {
    List<OvertimeRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    List<OvertimeRequest> findByStatus(WorkRequestStatus PENDING_MANAGER);

    List<OvertimeRequest> findByStatusAndEmployee_Department_Id(WorkRequestStatus pendingManager,
            Long departmentId);

    List<OvertimeRequest> findByStatusAndEmployee_Department_ParentDepartment_Id(WorkRequestStatus PENDING_HEAD,
            Long departmentId);

    List<OvertimeRequest> findByStatusInAndWorkDateBetween(List<WorkRequestStatus> of, LocalDate startDate,
            LocalDate endDate);

    List<OvertimeRequest> findByEmployee_IdAndWorkDate(Long employeeId, LocalDate date);

    List<OvertimeRequest> findByEmployee_IdAndStatusIn(Long employeeId, List<WorkRequestStatus> assignedStatuses);

    List<OvertimeRequest> findByCreatedByOrderByCreatedAtDesc(String creatorId);

    @Query(value = """
            SELECT
                e.code,
                e.name,
                or2.status,
                d.name AS department_name,
                p.name AS position_name,
                DATE_FORMAT(or2.start_time, '%d/%m/%Y') AS ngay_tang_ca_start,
                DATE_FORMAT(or2.end_time, '%d/%m/%Y') AS ngay_tang_ca_end,
                DATE_FORMAT(or2.start_time, '%d/%m/%Y %H:%i') AS ngay_gio_bat_dau,
                DATE_FORMAT(or2.end_time, '%d/%m/%Y %H:%i') AS ngay_gio_ket_thuc,
                TIMESTAMPDIFF(MINUTE, or2.start_time, or2.end_time)/60 AS gio_tang_ca, -- giờ tăng ca
                or2.reason AS ly_do_OT
            FROM overtime_requests or2
            JOIN employees e ON or2.employee_id = e.id
            JOIN departments d ON e.department_id = d.id
            JOIN position p ON e.position_id = p.id
            WHERE or2.status IN :statuses
            AND DATE(or2.start_time) BETWEEN :startDate AND :endDate
            """, nativeQuery = true)
    List<Object[]> findOvertimeByStatus(@Param("statuses") List<String> statuses,
            @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("""
            SELECT r FROM OvertimeRequest r
            JOIN FETCH r.employee e
            WHERE r.workDate BETWEEN :from AND :to
            AND (r.actualStartTime IS NULL OR r.actualEndTime IS NULL)
            """)
    List<OvertimeRequest> findRequestsNeedActualUpdate(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    List<OvertimeRequest> findAllByOrderByCreatedAtDesc();
}