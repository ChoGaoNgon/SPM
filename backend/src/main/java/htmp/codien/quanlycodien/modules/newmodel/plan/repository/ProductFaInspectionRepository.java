package htmp.codien.quanlycodien.modules.newmodel.plan.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanInspection;

public interface ProductFaInspectionRepository
        extends JpaRepository<ProductPlanInspection, Long>, JpaSpecificationExecutor<ProductPlanInspection> {
    Optional<ProductPlanInspection> findByPlan_Id(Long planId);

    @Query("SELECT f FROM ProductPlanInspection f WHERE f.plan.id = :planId ORDER BY f.createdAt DESC")
    Optional<ProductPlanInspection> findLatestByPlanId(@Param("planId") Long planId);

    @Modifying
    @Query("DELETE FROM ProductPlanInspection f WHERE f.plan.id = :planId")
    void deleteAllByPlanId(@Param("planId") Long planId);

    Boolean existsByPlanId(Long planId);

    @Query("""
            SELECT pi
            FROM ProductPlanInspection pi
            JOIN FETCH pi.plan p
            JOIN FETCH p.product pr
            JOIN FETCH pr.model m
            LEFT JOIN FETCH m.customer c
            WHERE pi.inspectionDeadline IS NOT NULL
                AND (
                            pi.inspectionDateActual IS NULL
                            OR pi.inspectedQuantity IS NULL
                            OR pi.finalResult IS NULL
                )
            ORDER BY pi.inspectionDeadline ASC, p.requestStartTime ASC
            """)
    List<ProductPlanInspection> findAllPendingInspectionInputs();

}
