package htmp.codien.quanlycodien.modules.newmodel.productionLot.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.newmodel.productionLot.entity.ProductionLotDefectCode;

@Repository
public interface ProductionLotDefectCodeRepository extends JpaRepository<ProductionLotDefectCode, Long> {

        List<ProductionLotDefectCode> findByProductionLotId(Long productionLotId);

        void deleteByProductionLotId(Long productionLotId);

        @Query("SELECT pldc FROM ProductionLotDefectCode pldc " +
                        "WHERE pldc.productionLot.id = :productionLotId AND pldc.defectCode.id = :defectCodeId")
        ProductionLotDefectCode findByProductionLotIdAndDefectCodeId(
                        @Param("productionLotId") Long productionLotId,
                        @Param("defectCodeId") Long defectCodeId);

        @Modifying
        @Query("delete from ProductionLotDefectCode d where d.productionLot.plan.id = :planId")
        void deleteByPlanId(@Param("planId") Long planId);
}