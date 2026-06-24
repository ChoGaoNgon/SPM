package htmp.codien.quanlycodien.modules.newmodel.plan.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.common.enums.HtmpStatus;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PendingSampleReceiptDto;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.MachinePlanConflictProjection;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.MoldTrialPlanListView;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.MoldTrialWeeklyCustomerProjection;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.ProductPlanProjection;

public interface ProductPlanRepository extends JpaRepository<ProductPlan, Long> {
        List<ProductPlan> findByProduct_Id(Long productId);

        int countByProductId(Long productId);

        Boolean existsByNameAndProduct_IdAndTypePlan(String name, Long productId, TypePlan typePlan);

        List<ProductPlan> findByTypePlan(TypePlan typePlan, Sort sort);

        Boolean existsByNameAndProduct_Id(String name, Long productId);

        Optional<ProductPlan> findTopByProductIdOrderByCreatedAtDesc(Long productId);

        Optional<ProductPlan> findTopByHtmpResinOrderByCreatedAtDesc(String htmpResin);

        @Query("SELECT DISTINCT p.htmpResin FROM ProductPlan p WHERE p.htmpResin IS NOT NULL ORDER BY p.htmpResin")
        List<String> findDistinctHtmpResin();

        @Query("SELECT DISTINCT p.dryer FROM ProductPlan p WHERE p.dryer IS NOT NULL ORDER BY p.dryer")
        List<String> findDistinctDryer();

        @Query("SELECT DISTINCT p.processStep FROM ProductPlan p WHERE p.processStep IS NOT NULL ORDER BY p.processStep")
        List<String> findDistinctProcessStep();

        @Modifying
        @Query("delete from ProductPlan p where p.product.id = :productId")
        void deleteByProductId(@Param("productId") Long productId);

        @Modifying
        @Query("delete from ProductPlan p where p.id = :planId")
        void deleteByPlanId(@Param("planId") Long planId);

        @Query(value = """
                            SELECT *
                            FROM vw_plan_list
                            WHERE (:from IS NULL OR trial_start_request >= :from)
                              AND (:to IS NULL OR trial_start_request < :to)
                              AND (:typePlan IS NULL OR type_plan = :typePlan)
                            ORDER BY trial_start_request
                        """, nativeQuery = true)
        List<MoldTrialPlanListView> search(
                        @Param("from") LocalDateTime from,
                        @Param("to") LocalDateTime to,
                        @Param("typePlan") String typePlan);

        long countByTypePlanAndCreatedAtGreaterThanEqualAndCreatedAtLessThanAndStatusNot(
                        TypePlan typePlan,
                        LocalDateTime from,
                        LocalDateTime to,
                        HtmpStatus excludedStatus);

        @Query("""
                        select count(p)
                        from ProductPlan p
                        where p.typePlan = :typePlan
                        and p.createdAt >= :from
                        and p.createdAt < :to
                                                            and p.status <> :excludedStatus
                        and p.createdBy in (
                          select e.code
                          from Employee e
                          where e.department.id = :departmentId
                        )
                        """)
        long countPlannedByCreatorDepartment(
                        @Param("departmentId") Long departmentId,
                        @Param("typePlan") TypePlan typePlan,
                        @Param("from") LocalDateTime from,
                        @Param("to") LocalDateTime to,
                        @Param("excludedStatus") HtmpStatus excludedStatus);

        @Query("""
                        select (count(p) > 0)
                        from ProductPlan p
                        where p.machine.id = :machineId
                        and coalesce(p.actualStartTime, p.requestStartTime) is not null
                        and coalesce(p.actualEndTime, p.requestEndTime) is not null
                        and coalesce(p.actualStartTime, p.requestStartTime) < :requestEndTime
                        and coalesce(p.actualEndTime, p.requestEndTime) > :requestStartTime
                        and p.status <> :excludedStatus
                        and (:excludedPlanId is null or p.id <> :excludedPlanId)
                        """)
        boolean existsOverlappingPlanByMachineId(
                        @Param("machineId") Long machineId,
                        @Param("requestStartTime") LocalDateTime requestStartTime,
                        @Param("requestEndTime") LocalDateTime requestEndTime,
                        @Param("excludedStatus") HtmpStatus excludedStatus,
                        @Param("excludedPlanId") Long excludedPlanId);

        @Query("""
                        select
                          p.id as planId,
                          p.name as planName,
                          p.product.id as productId,
                          p.product.code as productCode,
                          p.product.name as productName,
                          coalesce(p.actualStartTime, p.requestStartTime) as conflictStartTime,
                          coalesce(p.actualEndTime, p.requestEndTime) as conflictEndTime
                        from ProductPlan p
                        where p.machine.id = :machineId
                        and coalesce(p.actualStartTime, p.requestStartTime) is not null
                        and coalesce(p.actualEndTime, p.requestEndTime) is not null
                        and coalesce(p.actualStartTime, p.requestStartTime) < :requestEndTime
                        and coalesce(p.actualEndTime, p.requestEndTime) > :requestStartTime
                        and p.status <> :excludedStatus
                        and (:excludedPlanId is null or p.id <> :excludedPlanId)
                        order by coalesce(p.actualStartTime, p.requestStartTime) asc
                        """)
        List<MachinePlanConflictProjection> findOverlappingPlansByMachineId(
                        @Param("machineId") Long machineId,
                        @Param("requestStartTime") LocalDateTime requestStartTime,
                        @Param("requestEndTime") LocalDateTime requestEndTime,
                        @Param("excludedStatus") HtmpStatus excludedStatus,
                        @Param("excludedPlanId") Long excludedPlanId);

        @Query(value = """
                        SELECT
                            p.id AS productId,
                            p.code AS productCode,
                            p.name AS productName,
                            md.code AS modelCode,
                            md.id AS modelId,
                            m.code AS moldCode,
                            pp.id AS planId,
                            pp.name AS planName,
                            pp.created_by AS createdBy,
                            pp.type_plan AS planType,
                            pp.status AS planStatus
                        FROM product_plans pp
                        JOIN products p ON p.id = pp.product_id
                        LEFT JOIN molds m ON m.id = p.mold_id
                        LEFT JOIN models md ON md.id = p.model_id
                        WHERE (:status IS NULL OR pp.status = :status)
                        ORDER BY pp.created_at DESC
                        """, nativeQuery = true)
        List<ProductPlanProjection> findProductPlansByStatus(@Param("status") String status);

        @Query(value = """
                        SELECT
                                c.id AS customerId,
                                c.name AS customerName,
                                COUNT(DISTINCT pp.id) AS totalMoldTrials,
                                COUNT(DISTINCT CASE WHEN pi.final_result = 'OK' THEN pp.id ELSE NULL END) AS okMoldTrials,
                                COUNT(DISTINCT CASE WHEN pi.final_result = 'NG' THEN pp.id ELSE NULL END) AS ngMoldTrials
                        FROM product_plans pp
                        JOIN products p ON p.id = pp.product_id
                        JOIN models md ON md.id = p.model_id
                        JOIN customers c ON c.id = md.customer_id
                        LEFT JOIN product_plan_inspections pi ON pi.plan_id = pp.id
                        WHERE pp.type_plan = 'MOLD_TRIAL'
                            AND pp.request_start_time >= :fromDate
                            AND pp.request_start_time < :toDate
                        GROUP BY c.id, c.name
                        HAVING COUNT(DISTINCT pp.id) > 0
                        ORDER BY totalMoldTrials DESC, c.id ASC
                        """, nativeQuery = true)
        List<MoldTrialWeeklyCustomerProjection> getMoldTrialWeeklyStatisticsByCustomer(
                        @Param("fromDate") LocalDateTime fromDate,
                        @Param("toDate") LocalDateTime toDate);

        @Query(value = """
                        SELECT
                            p.id AS productId,
                            p.code AS productCode,
                            p.name AS productName,
                            md.code AS modelCode,
                            md.id AS modelId,
                            m.code AS moldCode,
                            pp.id AS planId,
                            pp.name AS planName,
                            pp.created_by AS createdBy,
                            pp.type_plan AS planType,
                            pp.status AS planStatus
                        FROM product_plans pp
                        JOIN products p ON p.id = pp.product_id
                        LEFT JOIN molds m ON m.id = p.mold_id
                        LEFT JOIN models md ON md.id = p.model_id
                        WHERE pp.actual_fa_submit_date IS NULL
                          -- Điều kiện: Ngày hiện tại lớn hơn hoặc bằng (Ngày yêu cầu - 7 ngày)
                          AND NOW() >= (pp.expected_fa_submit_date - INTERVAL 7 DAY);
                              """, nativeQuery = true)
        List<ProductPlanProjection> findProductPlansWithNullActualFaSubmitDate();

        @Query(value = """
                        Select
                        	m.id AS modelId,
                        	m.code AS modelCode,
                        	p.id AS productId,
                        	p.code AS productCode,
                        	pl.id  AS planId,
                        	pl.name AS planName,
                        	pl.product_sample_submit_date
                        FROM product_plans pl
                        join products p on p.id = pl.product_id
                        join models m on m.id = p.model_id
                        LEFT join product_plan_inspections pli on pl.id = pli.plan_id
                        where pl.status = 'WAITINGQCCHECK'
                          AND pli.plan_id IS NULL
                        ORDER BY pl.product_sample_submit_date ASC
                                                """, nativeQuery = true)
        List<PendingSampleReceiptDto> findPendingSampleReceipts();

}
