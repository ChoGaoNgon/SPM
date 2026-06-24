package htmp.codien.quanlycodien.modules.newmodel.plan.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductDeliveryRepository extends JpaRepository<ProductDelivery, Long> {
    @Query(value = "SELECT d.* " +
            "FROM product_deliveries d " +
            "JOIN product_plan_inspections i ON d.inspection_id = i.id " +
            "JOIN product_plans p ON i.plan_id = p.id " +
            "WHERE p.id = :planId", nativeQuery = true)
    Optional<ProductDelivery> findByMoldTrialPlanId(@Param("planId") Long planId);

    boolean existsByInspectionId(Long inspectionId);

    @Modifying
    @Query("DELETE FROM ProductDelivery f WHERE f.inspection.id = :inspectionId")
    void deleteByInspectionId(@Param("inspectionId") Long inspectionId);
}
