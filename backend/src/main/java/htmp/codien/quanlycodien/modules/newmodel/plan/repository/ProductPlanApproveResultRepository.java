package htmp.codien.quanlycodien.modules.newmodel.plan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanApproveResult;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductPlanApproveResultRepository
                extends JpaRepository<ProductPlanApproveResult, Long> {

        List<ProductPlanApproveResult> findByPlan_Id(Long planId);

        Optional<ProductPlanApproveResult> findByPlan_IdAndDepartmentCode(Long planId,
                        String departmentCode);

        @Query("SELECT r FROM ProductPlanApproveResult r WHERE r.plan.id = :planId ORDER BY r.createdAt DESC")
        List<ProductPlanApproveResult> findByPlanIdOrderByCreatedAtDesc(
                        @Param("planId") Long planId);

        @Modifying
        void deleteByPlan_IdAndDepartmentCode(Long planId, String departmentCode);

        @Modifying
        @Query("delete from ProductPlanApproveResult r where r.plan.id = :planId")
        void deleteByPlanId(@Param("planId") Long planId);
}