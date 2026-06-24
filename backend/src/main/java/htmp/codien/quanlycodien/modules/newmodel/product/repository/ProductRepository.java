package htmp.codien.quanlycodien.modules.newmodel.product.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.newmodel.product.entity.Product;
import htmp.codien.quanlycodien.modules.newmodel.productModel.entity.Model;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.ProductProjection;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    List<Product> findByModel(Model model);

    List<Product> findByCode(String productCode);

    @Query(value = """
            SELECT
                pd.code AS code,
                pd.name AS name,
                m.code AS moldCode,
                e.name AS employee,
                p.type AS type,
                CASE
                    WHEN p.type = 'JIG' THEN
                        CASE
                            WHEN thietke.completion_date IS NULL THEN 'Đang thiết kế'
                            WHEN thietke.completion_date IS NOT NULL AND muahang.completion_date IS NULL THEN 'Đang mua hàng'
                            WHEN muahang.completion_date IS NOT NULL AND giacong.completion_date IS NULL THEN 'Đang gia công'
                            WHEN giacong.completion_date IS NOT NULL AND laprap.completion_date IS NULL THEN 'Đang lắp ráp'
                            WHEN laprap.completion_date IS NOT NULL AND thunghiem.completion_date IS NULL THEN 'Đang thử nghiệm'
                            WHEN thunghiem.completion_date IS NOT NULL AND bangiao.completion_date IS NULL THEN 'Đang bàn giao'
                            ELSE 'Hoàn thành'
                        END
                    ELSE
                        CASE
                            WHEN thietke.completion_date IS NULL THEN 'Đang thiết kế'
                            WHEN thietke.completion_date IS NOT NULL AND muahang.completion_date IS NULL THEN 'Đang mua hàng'
                            WHEN muahang.completion_date IS NOT NULL AND giacong.completion_date IS NULL THEN 'Đang gia công'
                            WHEN giacong.completion_date IS NOT NULL AND laprap.completion_date IS NULL THEN 'Đang lắp ráp'
                            WHEN laprap.completion_date IS NOT NULL AND bangiao.completion_date IS NULL THEN 'Đang bàn giao'
                            WHEN bangiao.completion_date IS NOT NULL AND thunghiem.completion_date IS NULL THEN 'Đang thử nghiệm'
                            ELSE 'Hoàn thành'
                        END
                END AS currentStatus
            FROM products pd
            JOIN processes p ON pd.id = p.product_id
            JOIN employees e ON e.id = p.employee_id
            JOIN mold m ON p.mold_id = m.id
            LEFT JOIN processes_stage thietke  ON thietke.process_id = p.id AND thietke.name = 'Thiết kế'
            LEFT JOIN processes_stage muahang  ON muahang.process_id = p.id AND muahang.name = 'Mua hàng'
            LEFT JOIN processes_stage giacong  ON giacong.process_id = p.id AND giacong.name = 'Gia công'
            LEFT JOIN processes_stage laprap   ON laprap.process_id = p.id AND laprap.name = 'Lắp ráp'
            LEFT JOIN processes_stage thunghiem ON thunghiem.process_id = p.id AND thunghiem.name = 'Thử nghiệm'
            LEFT JOIN processes_stage bangiao  ON bangiao.process_id = p.id AND bangiao.name = 'Bàn giao'
            WHERE
            (
                (p.type = 'JIG' AND (
                    thietke.completion_date IS NULL OR
                    (thietke.completion_date IS NOT NULL AND muahang.completion_date IS NULL) OR
                    (muahang.completion_date IS NOT NULL AND giacong.completion_date IS NULL) OR
                    (giacong.completion_date IS NOT NULL AND laprap.completion_date IS NULL) OR
                    (laprap.completion_date IS NOT NULL AND thunghiem.completion_date IS NULL) OR
                    (thunghiem.completion_date IS NOT NULL AND bangiao.completion_date IS NULL)
                ))
                OR
                (p.type != 'JIG' AND (
                    thietke.completion_date IS NULL OR
                    (thietke.completion_date IS NOT NULL AND muahang.completion_date IS NULL) OR
                    (muahang.completion_date IS NOT NULL AND giacong.completion_date IS NULL) OR
                    (giacong.completion_date IS NOT NULL AND laprap.completion_date IS NULL) OR
                    (laprap.completion_date IS NOT NULL AND bangiao.completion_date IS NULL) OR
                    (bangiao.completion_date IS NOT NULL AND thunghiem.completion_date IS NULL)
                ))
            )
            """, nativeQuery = true)
    List<Object[]> findProductStatuses();

    @Query(value = """
            WITH phase_list AS (
                SELECT 'Chưa thiết kế' AS phase_name
                UNION ALL SELECT 'Thiết kế'
                UNION ALL SELECT 'Mua hàng'
                UNION ALL SELECT 'Gia công'
                UNION ALL SELECT 'Lắp ráp'
                UNION ALL SELECT 'Bàn giao'
                UNION ALL SELECT 'Thử nghiệm'
            ),
            types AS (
                SELECT DISTINCT type FROM processes
            ),
            status_count AS (
                -- Đếm số lượng từng giai đoạn
                SELECT
                    CASE
                        WHEN ps.name = 'Thiết kế' AND ps.completion_date IS NULL THEN 'Chưa thiết kế'
                        ELSE ps.name
                    END AS phase_name,
                    p.type,
                    COUNT(*) AS total
                FROM processes_stage ps
                JOIN processes p ON ps.process_id = p.id
                JOIN products pd ON pd.id = p.product_id
                WHERE (
                    (ps.name = 'Thiết kế' AND ps.completion_date IS NULL)
                    OR (ps.completion_date BETWEEN :startDate AND :endDate)
                )
                GROUP BY
                    CASE
                        WHEN ps.name = 'Thiết kế' AND ps.completion_date IS NULL THEN 'Chưa thiết kế'
                        ELSE ps.name
                    END,
                    p.type
            )
            SELECT
                t.type,
                pl.phase_name,
                COALESCE(sc.total, 0) AS total
            FROM types t
            CROSS JOIN phase_list pl
            LEFT JOIN status_count sc
                ON sc.type = t.type
                AND sc.phase_name = pl.phase_name
            """, nativeQuery = true)
    List<Object[]> countProductByPhaseAndType(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query(value = """
            SELECT
                SUM(CASE
                        WHEN thietke.completion_date IS NULL
                        THEN 1 ELSE 0
                    END) AS 'Đang thiết kế',
                SUM(CASE
                        WHEN thietke.completion_date IS NOT NULL
                          AND muahang.completion_date IS NULL
                        THEN 1 ELSE 0
                    END) AS 'Đang mua hàng',
                SUM(CASE
                        WHEN muahang.completion_date IS NOT NULL
                          AND giacong.completion_date IS NULL
                        THEN 1 ELSE 0
                    END) AS 'Đang gia công',
                SUM(CASE
                        WHEN giacong.completion_date IS NOT NULL
                          AND laprap.completion_date IS NULL
                        THEN 1 ELSE 0
                    END) AS 'Đang lắp ráp',
                SUM(CASE
                        WHEN laprap.completion_date IS NOT NULL
                          AND bangiao.completion_date IS NULL
                        THEN 1 ELSE 0
                    END) AS 'Đang bàn giao',
                SUM(CASE
                        WHEN bangiao.completion_date IS NOT NULL
                        THEN 1 ELSE 0
                    END) AS 'Hoàn thành'
            FROM
                products pd
                JOIN processes p ON pd.id = p.product_id
                JOIN employees e ON e.id = p.employee_id
                LEFT JOIN processes_stage thietke ON thietke.process_id = p.id AND thietke.name = 'Thiết kế'
                LEFT JOIN processes_stage muahang ON muahang.process_id = p.id AND muahang.name = 'Mua hàng'
                LEFT JOIN processes_stage giacong ON giacong.process_id = p.id AND giacong.name = 'Gia công'
                LEFT JOIN processes_stage laprap ON laprap.process_id = p.id AND laprap.name = 'Lắp ráp'
                LEFT JOIN processes_stage thunghiem ON thunghiem.process_id = p.id AND thunghiem.name = 'Thử nghiệm'
                LEFT JOIN processes_stage bangiao ON bangiao.process_id = p.id AND bangiao.name = 'Bàn giao';
            """, nativeQuery = true)
    List<Object[]> countProductByStages();

    @Query(value = """
                SELECT
                    e.name AS employeeName,
                    SUM(CASE WHEN p.type = 'TAYGA'  AND thunghiem.completion_date IS NOT NULL THEN 1 ELSE 0 END) AS tayga,
                    SUM(CASE WHEN p.type = 'BANCAT' AND thunghiem.completion_date IS NOT NULL THEN 1 ELSE 0 END) AS bancat,
                    SUM(CASE WHEN p.type = 'JIG'    AND thunghiem.completion_date IS NOT NULL THEN 1 ELSE 0 END) AS jig
                FROM
                    products pd
                    JOIN processes p ON pd.id = p.product_id
                    JOIN employees e ON e.id = p.employee_id
                    LEFT JOIN processes_stage thunghiem
                        ON thunghiem.process_id = p.id
                        AND thunghiem.name = 'Thử nghiệm'
                WHERE
                    thunghiem.completion_date BETWEEN :startDate AND :endDate
                GROUP BY
                    e.name
                ORDER BY
                    e.name
            """, nativeQuery = true)
    List<Object[]> getProductTestSummaryByEmployee(@Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    List<Product> findByModelId(Long modelId);

    List<Product> findByModelCustomerId(Long customerId);

    Boolean existsByCode(String productCode);

    Boolean existsByCodeAndIdNot(String productCode, Long id);

    @Modifying
    @Query("DELETE FROM Product p WHERE p.model.id = :modelId")
    void deleteAllProductsByModelId(@Param("modelId") Long modelId);

    List<Product> findByMoldId(Long id);

    @Query(value = """
            SELECT COUNT(DISTINCT p.id)
            FROM products p
            WHERE EXISTS (
                SELECT 1 FROM product_plans pp
                WHERE pp.product_id = p.id
                AND pp.type_plan = 'MOLD_TRIAL'
                AND pp.request_start_time = (
                    SELECT MAX(pp2.request_start_time)
                    FROM product_plans pp2
                    WHERE pp2.product_id = p.id
                )
            )
            """, nativeQuery = true)
    Long countByIsMoldTrialTrue();

    @Query(value = """
            SELECT COUNT(DISTINCT p.id)
            FROM products p
            WHERE EXISTS (
                SELECT 1 FROM product_plans pp
                WHERE pp.product_id = p.id
                AND pp.type_plan = 'EVENT'
                AND pp.request_start_time = (
                    SELECT MAX(pp2.request_start_time)
                    FROM product_plans pp2
                    WHERE pp2.product_id = p.id
                )
            )
            """, nativeQuery = true)
    Long countByIsEventTrue();

    @Query(value = """
            SELECT COUNT(DISTINCT p.id)
            FROM products p
            WHERE EXISTS (
                SELECT 1 FROM product_plans pp
                WHERE pp.product_id = p.id
                AND pp.type_plan = 'SECOND_PROCESS'
                AND pp.request_start_time = (
                    SELECT MAX(pp2.request_start_time)
                    FROM product_plans pp2
                    WHERE pp2.product_id = p.id
                )
            )
            """, nativeQuery = true)
    Long countByIsSecondProcessTrue();

    @Query(value = """
            SELECT DISTINCT p.id as id, p.code as code, p.name as name,
                 m.code as moldCode, md.code as modelCode, md.id as modelId,
                 '' as gateType, p.image as image, p.nmd_info_status as nmdInfoStatus
            FROM products p
            LEFT JOIN molds m ON p.mold_id = m.id
            LEFT JOIN models md ON p.model_id = md.id
            WHERE EXISTS (
                SELECT 1 FROM product_plans pp
                WHERE pp.product_id = p.id
                AND pp.type_plan = :planType
                AND pp.request_start_time = (
                    SELECT MAX(pp2.request_start_time)
                    FROM product_plans pp2
                    WHERE pp2.product_id = p.id
                )
            )
            ORDER BY p.code
            """, nativeQuery = true)
    List<ProductProjection> findProductsByPlanType(@Param("planType") String planType);

    @Query(value = """
            SELECT DISTINCT p.id as id, p.code as code, p.name as name,
                 m.code as moldCode, md.code as modelCode, md.id as modelId,
                 '' as gateType, p.image as image, p.nmd_info_status as nmdInfoStatus,
                    p.info_received_date as infoReceivedDate, p.created_at as createdAt
            FROM products p
            LEFT JOIN molds m ON p.mold_id = m.id
            LEFT JOIN models md ON p.model_id = md.id
            WHERE p.nmd_info_status = 'PENDING'
            ORDER BY p.code
            """, nativeQuery = true)
    List<ProductProjection> findProductsPendingNmdApproval();

    @Query(value = """
            SELECT DISTINCT p.id as id, p.code as code, p.name as name,
                 m.code as moldCode, md.code as modelCode, md.id as modelId,
                 '' as gateType, p.image as image, p.nmd_info_status as nmdInfoStatus,
                    p.info_received_date as infoReceivedDate, p.created_at as createdAt
            FROM products p
            LEFT JOIN molds m ON p.mold_id = m.id
            LEFT JOIN models md ON p.model_id = md.id
            WHERE p.is_approved_by_head_kd = FALSE
            ORDER BY p.code
            """, nativeQuery = true)
    List<ProductProjection> findProductsPendingBusinessApproval();

    @Query(value = """
            SELECT p.id AS id, p.code AS code, p.name AS name,
                   m.code AS moldCode, md.code AS modelCode, md.id AS modelId,
                   '' AS gateType, p.image AS image, p.nmd_info_status AS nmdInfoStatus,
                   p.info_received_date AS infoReceivedDate, p.created_at AS createdAt,
                   p.mp_delay_reason AS mpDelayReason
            FROM products p
            LEFT JOIN molds m ON p.mold_id = m.id
            LEFT JOIN models md ON p.model_id = md.id
            WHERE p.mp_delay_reason IS NOT NULL AND p.mp_delay_reason != ''
            ORDER BY p.code
            """, nativeQuery = true)
    List<ProductProjection> findProductByMpDelay();
}