package htmp.codien.quanlycodien.modules.newmodel.plan.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.common.enums.ApprovalStatus;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanApproval;

@Repository
public interface ProductPlanApprovalRepository extends JpaRepository<ProductPlanApproval, Long> {

    List<ProductPlanApproval> findByPlan_IdOrderByApprovalOrderAsc(Long planId);

    Optional<ProductPlanApproval> findByPlan_IdAndApprovalType(Long planId, String approvalType);

    @Query("SELECT a FROM ProductPlanApproval a WHERE a.plan.id = :planId AND a.approvalOrder < :approvalOrder")
    List<ProductPlanApproval> findPreviousApprovals(@Param("planId") Long planId,
            @Param("approvalOrder") Integer approvalOrder);

    @Query("SELECT COUNT(a) FROM ProductPlanApproval a WHERE a.plan.id = :planId AND a.status = :status")
    long countByPlanIdAndStatus(@Param("planId") Long planId, @Param("status") ApprovalStatus status);

    @Query("SELECT COUNT(a) FROM ProductPlanApproval a WHERE a.plan.id = :planId")
    long countByPlanId(@Param("planId") Long planId);

    @Modifying
    @Query("delete from ProductPlanApproval a where a.plan.id = :planId")
    void deleteByPlanId(@Param("planId") Long planId);
}
