package htmp.codien.quanlycodien.modules.newmodel.productEvent.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.EventStatusPlanProductProjection;

public interface EventStatisticsRepository extends JpaRepository<ProductPlan, Long> {

    @Query(value = """
            SELECT COALESCE(MAX(COALESCE(CAST(REGEXP_SUBSTR(UPPER(TRIM(pp.name)), '[0-9]+$') AS UNSIGNED), 0)), 0)
            FROM product_plans pp
            WHERE pp.type_plan = :typePlan
            """, nativeQuery = true)
    Integer findMaxEventNoAllByTypePlan(@Param("typePlan") String typePlan);

    @Query(value = """
            SELECT
                COALESCE(CAST(REGEXP_SUBSTR(UPPER(TRIM(pp.name)), '[0-9]+$') AS UNSIGNED), 0) AS eventNo,
                pp.status AS status,
                pp.id AS planId,
                pp.name AS planCode,
                p.id AS productId,
                p.code AS productCode,
                p.name AS productName,
                m.id AS modelId,
                m.code AS modelCode,
                c.id AS customerId,
                c.name AS customerName
            FROM product_plans pp
            JOIN products p ON p.id = pp.product_id
            JOIN models m ON m.id = p.model_id
            JOIN customers c ON c.id = m.customer_id
                WHERE pp.type_plan = :typePlan
              AND COALESCE(CAST(REGEXP_SUBSTR(UPPER(TRIM(pp.name)), '[0-9]+$') AS UNSIGNED), 0) > 0
            ORDER BY eventNo, pp.status, pp.id
            """, nativeQuery = true)
    List<EventStatusPlanProductProjection> getEventStatusPlanProductStatistics(@Param("typePlan") String typePlan);
}
