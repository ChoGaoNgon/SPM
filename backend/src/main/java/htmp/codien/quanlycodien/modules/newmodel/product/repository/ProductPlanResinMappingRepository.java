package htmp.codien.quanlycodien.modules.newmodel.product.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanResinMapping;

public interface ProductPlanResinMappingRepository extends JpaRepository<ProductPlanResinMapping, Long> {
    List<ProductPlanResinMapping> findByPlanId(Long planId);

    boolean existsByPlanIdAndResinCode(Long planId, String resinCode);

    Optional<ProductPlanResinMapping> findByPlanIdAndResinCode(Long planId, String resinCode);

    @Modifying
    void deleteByPlanId(Long planId);
}
