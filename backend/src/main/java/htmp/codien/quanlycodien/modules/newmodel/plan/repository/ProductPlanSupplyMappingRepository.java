package htmp.codien.quanlycodien.modules.newmodel.plan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanSupplyMapping;

@Repository
public interface ProductPlanSupplyMappingRepository extends JpaRepository<ProductPlanSupplyMapping, Long> {

    @Modifying
    void deleteByPlan_Id(Long planId);
}
