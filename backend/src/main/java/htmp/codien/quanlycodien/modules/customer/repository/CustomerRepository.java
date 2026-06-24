package htmp.codien.quanlycodien.modules.customer.repository;

import htmp.codien.quanlycodien.common.enums.HtmpStatus;
import htmp.codien.quanlycodien.modules.customer.entity.Customer;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.CustomerCategoryStatisticsProjection;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.CustomerCurrentEventStatisticsProjection;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.CustomerPlanStatisticsProjection;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.CustomerProductStatusStatisticsProjection;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByName(String name);

    Boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

    @Query("""
            SELECT
                c as customer,
                COUNT(pp.id) as totalPlans
            FROM Customer c
            LEFT JOIN Model m ON m.customer.id = c.id
            LEFT JOIN Product p ON p.model.id = m.id
            LEFT JOIN ProductPlan pp ON pp.product.id = p.id
                                    WHERE pp.typePlan = :typePlan
                                        AND pp.status NOT IN :excludedStatuses
            GROUP BY c
                ORDER BY COUNT(pp.id) DESC
            """)
    List<CustomerPlanStatisticsProjection> statisticsCustomerPlan(
            Pageable pageable,
            @Param("typePlan") TypePlan typePlan,
            @Param("excludedStatuses") List<HtmpStatus> excludedStatuses);

    @Query(value = """
            SELECT COALESCE(MAX(COALESCE(CAST(REGEXP_SUBSTR(UPPER(TRIM(pp.name)), '[0-9]+$') AS UNSIGNED), 0)), 0)
            FROM product_plans pp
                                    WHERE pp.type_plan = 'EVENT'
                                        AND pp.status NOT IN (:excludedStatuses)
            """, nativeQuery = true)
    Integer findMaxEventNo(@Param("excludedStatuses") List<String> excludedStatuses);

    @Query(value = """
            SELECT COALESCE(MAX(COALESCE(CAST(REGEXP_SUBSTR(UPPER(TRIM(pp.name)), '[0-9]+$') AS UNSIGNED), 0)), 0)
            FROM product_plans pp
            WHERE pp.type_plan = 'EVENT'
                AND pp.status IN (:statuses)
            """, nativeQuery = true)
    Integer findMaxEventNoByStatus(@Param("statuses") List<String> statuses);

    @Query(value = """
            SELECT
                    c.id AS customerId,
                    c.name AS customerName,
                    COALESCE(CAST(REGEXP_SUBSTR(UPPER(TRIM(pp.name)), '[0-9]+$') AS UNSIGNED), 0) AS eventNo,
                    COUNT(DISTINCT p.id) AS productCount
            FROM customers c
            JOIN models m ON m.customer_id = c.id
            JOIN products p ON p.model_id = m.id
            JOIN product_plans pp ON pp.product_id = p.id
                                    WHERE pp.type_plan = 'EVENT'
                                        AND pp.status NOT IN (:excludedStatuses)
            GROUP BY c.id, c.name, COALESCE(CAST(REGEXP_SUBSTR(UPPER(TRIM(pp.name)), '[0-9]+$') AS UNSIGNED), 0)
            ORDER BY c.name, eventNo
            """, nativeQuery = true)
    List<CustomerCurrentEventStatisticsProjection> statisticsCurrentEventByCustomer(
            @Param("excludedStatuses") List<String> excludedStatuses);

    @Query(value = """
            SELECT
                c.id AS customerId,
                c.name AS customerName,
                COALESCE(CAST(REGEXP_SUBSTR(UPPER(TRIM(pp.name)), '[0-9]+$') AS UNSIGNED), 0) AS eventNo,
                COUNT(DISTINCT p.id) AS productCount
            FROM customers c
            JOIN models m ON m.customer_id = c.id
            JOIN products p ON p.model_id = m.id
            JOIN product_plans pp ON pp.product_id = p.id
            WHERE pp.type_plan = 'EVENT'
              AND pp.status IN (:statuses)
            GROUP BY c.id, c.name, COALESCE(CAST(REGEXP_SUBSTR(UPPER(TRIM(pp.name)), '[0-9]+$') AS UNSIGNED), 0)
            ORDER BY c.name, eventNo
            """, nativeQuery = true)
    List<CustomerCurrentEventStatisticsProjection> statisticsCurrentEventByCustomerByStatus(
            @Param("statuses") List<String> statuses);

    @Query(value = """
            SELECT
                c.id AS customerId,
                c.name AS customerName,
                COALESCE(p.product_category, 'UNKNOWN') AS productCategory,
                COUNT(DISTINCT p.id) AS totalProducts,
                COUNT(pp.id) AS totalPlans
            FROM customers c
            JOIN models m ON m.customer_id = c.id
            JOIN products p ON p.model_id = m.id
            JOIN product_plans pp ON pp.product_id = p.id
            WHERE pp.type_plan = :typePlan
              AND pp.status NOT IN (:excludedStatuses)
            GROUP BY c.id, c.name, p.product_category
            ORDER BY c.name
            """, nativeQuery = true)
    List<CustomerCategoryStatisticsProjection> statisticsCustomerPlanByCategory(
            @Param("typePlan") String typePlan,
            @Param("excludedStatuses") List<String> excludedStatuses);

    @Query(value = """
            SELECT
                c.name AS customerName,
                COUNT(CASE WHEN p.product_category IN ('FINISHED_INJECTION', 'SECOND_PROCESS_INJECTION') THEN 1 END) AS injectionCount,
                COUNT(CASE WHEN p.product_category IN ('SECOND_PROCESS_PRINT', 'SECOND_PROCESS_PAINT', 'SECOND_PROCESS_HOT_STAMPING', 'SECOND_PROCESS_LASER', 'FINISHED_PRINT', 'FINISHED_PAINT', 'FINISHED_LASER', 'FINISHED_HOT') THEN 1 END) AS secondProcessCount,
                COUNT(CASE WHEN p.product_category IN('FINISHED_ASSEMBLY') THEN 1 END) AS finishedCount,
                COUNT(p.id) AS totalProducts
            FROM customers c
            LEFT JOIN models m ON c.id = m.customer_id
            LEFT JOIN products p ON m.id = p.model_id
            GROUP BY c.id, c.name
            ORDER BY totalProducts DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<CustomerProductStatusStatisticsProjection> getCustomerStatistics(int limit);

    List<Customer> findByNameContainingIgnoreCase(String name);
}