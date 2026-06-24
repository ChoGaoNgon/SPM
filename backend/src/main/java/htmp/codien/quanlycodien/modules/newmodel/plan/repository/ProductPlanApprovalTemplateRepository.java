package htmp.codien.quanlycodien.modules.newmodel.plan.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanApprovalTemplate;

@Repository
public interface ProductPlanApprovalTemplateRepository extends JpaRepository<ProductPlanApprovalTemplate, Long> {

    List<ProductPlanApprovalTemplate> findAllByOrderByApprovalOrderAsc();

    List<ProductPlanApprovalTemplate> findByApprovalTypeOrderByApprovalOrderAsc(String approvalType);

    List<ProductPlanApprovalTemplate> findByRequiredOrderByApprovalOrderAsc(Boolean required);

    Optional<ProductPlanApprovalTemplate> findByApprovalTypeAndApprovalOrder(String approvalType,
            Integer approvalOrder);

    @Query("SELECT COUNT(p) FROM ProductPlanApprovalTemplate p WHERE p.required = true")
    Long countRequiredApprovals();

    boolean existsByApprovalTypeAndApprovalOrder(String approvalType, Integer approvalOrder);
}
