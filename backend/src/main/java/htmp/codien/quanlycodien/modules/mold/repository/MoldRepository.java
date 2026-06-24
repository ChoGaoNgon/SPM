package htmp.codien.quanlycodien.modules.mold.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import htmp.codien.quanlycodien.modules.mold.entity.Mold;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.MoldDevelopmentByCustomerProjection;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.MoldIssueStatisticsProjection;

public interface MoldRepository extends JpaRepository<Mold, Long>, JpaSpecificationExecutor<Mold> {
    Boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    Optional<Mold> findByCode(String code);

    @Query(value = """
            SELECT
                m.id AS moldId,
                m.code AS moldCode,
                COUNT(DISTINCT p.id) AS totalProducts,
                COUNT(DISTINCT ppi.id) AS totalIssues,
                COUNT(DISTINCT CASE WHEN ppi.is_implemented = 1 THEN ppi.id ELSE NULL END) AS completedIssues,
                COUNT(DISTINCT CASE WHEN ppi.is_implemented = 0 THEN ppi.id ELSE NULL END) AS pendingIssues,
                COUNT(DISTINCT CASE
                    WHEN ppi.is_implemented = 0 AND (ppi.cause IS NULL OR TRIM(ppi.cause) = '') THEN ppi.id
                    ELSE NULL
                END) AS pendingIssuesWithoutCause,
                COUNT(DISTINCT CASE
                    WHEN ppi.is_implemented = 0 AND (ppi.improve_plan IS NULL OR TRIM(ppi.improve_plan) = '') THEN ppi.id
                    ELSE NULL
                END) AS pendingIssuesWithoutImprovePlan
            FROM molds m
            LEFT JOIN products p ON m.id = p.mold_id
            LEFT JOIN product_plans pp ON p.id = pp.product_id
            LEFT JOIN product_plan_issues ppi ON pp.id = ppi.plan_id AND ppi.issue_type = 'MOLD_ERROR'
            GROUP BY m.id, m.code
                HAVING COUNT(DISTINCT ppi.id) > 0
                ORDER BY COUNT(DISTINCT ppi.id) DESC, m.id DESC
            """, nativeQuery = true)
    List<MoldIssueStatisticsProjection> getMoldIssueStatistics(Pageable pageable);

    @Query(value = """
            SELECT
                c.id AS customerId,
                c.name AS customerName,
                COUNT(DISTINCT m.id) AS developingMolds
            FROM customers c
            LEFT JOIN models md ON md.customer_id = c.id
            LEFT JOIN products p ON p.model_id = md.id
            LEFT JOIN molds m ON m.id = p.mold_id
            GROUP BY c.id, c.name
            HAVING COUNT(DISTINCT m.id) > 0
            ORDER BY developingMolds DESC, c.id ASC
            """, nativeQuery = true)
    List<MoldDevelopmentByCustomerProjection> getDevelopingMoldStatisticsByCustomer();

}
