package htmp.codien.quanlycodien.modules.newmodel.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanResinMapping;

public interface ProductPlanPlasticRepository extends JpaRepository<ProductPlanResinMapping, Long> {

    @Modifying
    @Query("delete from ProductPlanResinMapping p where p.plan.id = :planId")
    void deleteByPlanId(@Param("planId") Long planId);

    @Modifying
    @Query(value = "delete from product_plan_plastic where plan_id = :planId", nativeQuery = true)
    void deleteLegacyByPlanId(@Param("planId") Long planId);

}
