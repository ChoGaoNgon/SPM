package htmp.codien.quanlycodien.modules.newmodel.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductInsert;

public interface ProductInsertRepository extends JpaRepository<ProductInsert, Long> {
    @Modifying
    @Query("DELETE FROM ProductInsert pi WHERE pi.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);

    @Modifying
    @Query("DELETE FROM ProductInsert pi WHERE pi.plan.id = :planId")
    void deleteByPlanId(@Param("planId") Long planId);
}
