package htmp.codien.quanlycodien.modules.newmodel.productEvent.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.newmodel.productEvent.entity.ProductEventProductionLog;

public interface ProductEventProductionLogRepository extends JpaRepository<ProductEventProductionLog, Long> {
    List<ProductEventProductionLog> findByPlanId(Long planId);

    @Modifying
    @Query("DELETE FROM ProductEventProductionLog f WHERE f.plan.id = :planId")
    void deleteAllByPlanId(@Param("planId") Long planId);
}
