package htmp.codien.quanlycodien.modules.newmodel.productEvent.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.entity.ProductEventQcCheck;

public interface ProductEventQcCheckRepository extends JpaRepository<ProductEventQcCheck, Long> {
    ProductEventQcCheck findByPlan(ProductPlan plan);

    @Modifying
    @Query("DELETE FROM ProductEventQcCheck f WHERE f.plan.id = :pEventId")
    void deleteAllByProductEventId(@Param("pEventId") Long pEventId);
}
