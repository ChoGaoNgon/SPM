package htmp.codien.quanlycodien.modules.feedback.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackDashboardDepartmentResponse;
import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackDashboardEmployeeResponse;
import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackDashboardModuleResponse;
import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackDashboardPriorityItemResponse;
import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackDashboardStatsResponse;
import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackDashboardTypeResponse;
import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackSummaryResponse;
import htmp.codien.quanlycodien.modules.feedback.entity.SystemFeedback;
import htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus;

public interface SystemFeedbackRepository
        extends JpaRepository<SystemFeedback, Long>, JpaSpecificationExecutor<SystemFeedback> {
    @Query("""
                SELECT new htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackSummaryResponse(
                    sf.id,
                    sf.title,
                    sf.requestType,
                    sf.status,
                    sf.priority,
                    sf.module,
                    COALESCE(e.code, sf.createdBy),
                    COALESCE(e.name, sf.createdBy),
                    sf.createdAt,
                    sf.assignToEmployee.id,
                    e2.code,
                    e2.name
                )
                FROM SystemFeedback sf
                LEFT JOIN Employee e ON e.code = sf.createdBy
                LEFT JOIN sf.assignToEmployee e2
                WHERE (:employeeCode IS NULL OR :isDepartmentIT = true OR sf.createdBy = :employeeCode)
                ORDER BY sf.createdAt DESC
            """)
    List<SystemFeedbackSummaryResponse> findAllSystemFeedback(
            @Param("employeeCode") String employeeCode,
            @Param("isDepartmentIT") boolean isDepartmentIT);

    @Query("""
                SELECT new htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackDashboardStatsResponse(
                    COUNT(sf),
                    SUM(CASE WHEN sf.status = htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus.PENDING THEN 1 ELSE 0 END),
                    SUM(CASE WHEN sf.status = htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus.IN_PROGRESS THEN 1 ELSE 0 END),
                    SUM(CASE WHEN sf.status = htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus.DONE THEN 1 ELSE 0 END),
                    SUM(CASE WHEN sf.status = htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus.REJECTED THEN 1 ELSE 0 END)
                )
                FROM SystemFeedback sf
                WHERE (:employeeCode IS NULL OR :isDepartmentIT = true OR sf.createdBy = :employeeCode)
            """)
    SystemFeedbackDashboardStatsResponse getDashboardStats(
            @Param("employeeCode") String employeeCode,
            @Param("isDepartmentIT") boolean isDepartmentIT);

    @Query("""
            SELECT new htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackDashboardTypeResponse(
                sf.requestType,
                COUNT(sf)
            )
            FROM SystemFeedback sf
            WHERE (:employeeCode IS NULL OR :isDepartmentIT = true OR sf.createdBy = :employeeCode)
            GROUP BY sf.requestType
            ORDER BY COUNT(sf) DESC, sf.requestType ASC
            """)
    List<SystemFeedbackDashboardTypeResponse> getDashboardTypes(
            @Param("employeeCode") String employeeCode,
            @Param("isDepartmentIT") boolean isDepartmentIT);

    @Query("""
                SELECT new htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackDashboardModuleResponse(
                    CASE
                        WHEN sf.module IS NULL OR sf.module = '' THEN 'Khác'
                        ELSE sf.module
                    END,
                    COUNT(sf)
                )
                FROM SystemFeedback sf
                WHERE (:employeeCode IS NULL OR :isDepartmentIT = true OR sf.createdBy = :employeeCode)
                GROUP BY CASE
                    WHEN sf.module IS NULL OR sf.module = '' THEN 'Khác'
                    ELSE sf.module
                END
                ORDER BY COUNT(sf) DESC,
                    CASE
                        WHEN sf.module IS NULL OR sf.module = '' THEN 'Khác'
                        ELSE sf.module
                    END ASC
            """)
    List<SystemFeedbackDashboardModuleResponse> getDashboardModules(
            @Param("employeeCode") String employeeCode,
            @Param("isDepartmentIT") boolean isDepartmentIT);

    @Query("""
                SELECT new htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackDashboardEmployeeResponse(
                    CASE
                        WHEN assignee.name IS NULL OR assignee.name = '' THEN 'Chưa phân công'
                        ELSE assignee.name
                    END,
                    SUM(CASE WHEN sf.status = htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus.PENDING THEN 1 ELSE 0 END),
                    SUM(CASE WHEN sf.status = htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus.IN_PROGRESS THEN 1 ELSE 0 END),
                    SUM(CASE WHEN sf.status = htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus.DONE THEN 1 ELSE 0 END)
                )
                FROM SystemFeedback sf
                LEFT JOIN sf.assignToEmployee assignee
                WHERE (:employeeCode IS NULL OR :isDepartmentIT = true OR sf.createdBy = :employeeCode)
                    AND sf.status <> htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus.REJECTED
                GROUP BY CASE
                    WHEN assignee.name IS NULL OR assignee.name = '' THEN 'Chưa phân công'
                    ELSE assignee.name
                END
                ORDER BY
                    SUM(CASE WHEN sf.status = htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus.PENDING THEN 1 ELSE 0 END)
                    + SUM(CASE WHEN sf.status = htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus.IN_PROGRESS THEN 1 ELSE 0 END)
                    + SUM(CASE WHEN sf.status = htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus.DONE THEN 1 ELSE 0 END) DESC,
                    CASE
                        WHEN assignee.name IS NULL OR assignee.name = '' THEN 'Chưa phân công'
                        ELSE assignee.name
                    END ASC
            """)
    List<SystemFeedbackDashboardEmployeeResponse> getDashboardEmployees(
            @Param("employeeCode") String employeeCode,
            @Param("isDepartmentIT") boolean isDepartmentIT);

    @Query("""
                SELECT new htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackDashboardPriorityItemResponse(
                    sf.id,
                    sf.title,
                    sf.priority,
                    CASE WHEN sf.module IS NULL OR sf.module = '' THEN 'Khác' ELSE sf.module END,
                    CASE
                        WHEN assignee.name IS NULL OR assignee.name = '' THEN 'Chưa phân công'
                        ELSE assignee.name
                    END,
                    sf.status,
                    sf.createdAt
                )
                FROM SystemFeedback sf
                LEFT JOIN sf.assignToEmployee assignee
                WHERE (:employeeCode IS NULL OR :isDepartmentIT = true OR sf.createdBy = :employeeCode)
                    AND sf.status IN :statuses
                ORDER BY CASE sf.priority
                    WHEN htmp.codien.quanlycodien.common.enums.Priority.HIGH THEN 0
                    WHEN htmp.codien.quanlycodien.common.enums.Priority.MEDIUM THEN 1
                    WHEN htmp.codien.quanlycodien.common.enums.Priority.LOW THEN 2
                    ELSE 3
                END ASC,
                sf.createdAt DESC
            """)
    List<SystemFeedbackDashboardPriorityItemResponse> getDashboardPriorityItems(
            @Param("employeeCode") String employeeCode,
            @Param("isDepartmentIT") boolean isDepartmentIT,
            @Param("statuses") List<SystemFeedbackStatus> statuses,
            Pageable pageable);

    @Query("""
                SELECT new htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackDashboardDepartmentResponse(
                    d.name,
                    SUM(CASE WHEN sf.status = htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus.DONE THEN 1 ELSE 0 END) AS done_count,
                    SUM(CASE WHEN sf.status = htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus.IN_PROGRESS THEN 1 ELSE 0 END) AS in_progress_count,
                    SUM(CASE WHEN sf.status = htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus.PENDING THEN 1 ELSE 0 END) AS pending_count,
                    SUM(CASE WHEN sf.status = htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus.REJECTED THEN 1 ELSE 0 END) AS rejected_count
                )
                FROM SystemFeedback sf
                JOIN Employee e ON e.code = sf.createdBy
                JOIN Department d ON d.id = e.department.id
                GROUP BY d.name
            """)
    List<SystemFeedbackDashboardDepartmentResponse> getDashboardDepartments(String employeeCode, boolean departmentIT);
}
