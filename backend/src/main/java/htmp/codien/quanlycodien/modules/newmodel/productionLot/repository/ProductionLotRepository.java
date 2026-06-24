package htmp.codien.quanlycodien.modules.newmodel.productionLot.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.newmodel.productionLot.entity.ProductionLot;

@Repository
public interface ProductionLotRepository extends JpaRepository<ProductionLot, Long> {

        @EntityGraph(attributePaths = {
                        "defectDetails",
                        "defectDetails.defectCode",
                        "checkedBy",
                        "plan",
                        "plan.product"
        })
        List<ProductionLot> findByPlan_Id(Long productPlanId);

        List<ProductionLot> findByProductionDateBetween(LocalDate startDate, LocalDate endDate);

        @Query("SELECT pl FROM ProductionLot pl WHERE pl.qcCheckResult = :result")
        List<ProductionLot> findByQcCheckResult(@Param("result") String result);

        List<ProductionLot> findByCheckedById(Long checkedById);

        @Query("SELECT pl.productionDate, SUM(pl.quantity), SUM(pl.ngQuantity) " +
                        "FROM ProductionLot pl " +
                        "WHERE pl.productionDate BETWEEN :startDate AND :endDate " +
                        "GROUP BY pl.productionDate " +
                        "ORDER BY pl.productionDate")
        List<Object[]> getProductionStatisticsByDateRange(@Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        @Query("SELECT pl FROM ProductionLot pl WHERE pl.plan.id = :planId " +
                        "ORDER BY pl.productionDate DESC, pl.createdAt DESC LIMIT 1")
        ProductionLot findLatestByPlanId(@Param("planId") Long planId);

        @Modifying
        @Query("delete from ProductionLot pl where pl.plan.id = :planId")
        void deleteByPlanId(@Param("planId") Long planId);
}