package htmp.codien.quanlycodien.modules.newmodel.plan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanIssueDefectCode;

import java.util.List;

@Repository
public interface ProductPlanIssueDefectCodeRepository extends JpaRepository<ProductPlanIssueDefectCode, Long> {
    List<ProductPlanIssueDefectCode> findByIssueId(Long issueId);

    void deleteByIssueId(Long issueId);

    @Modifying
    @Query(value = "DELETE FROM product_plan_issue_defect_codes WHERE issue_id IN (SELECT id FROM product_plan_issues WHERE plan_id = :planId)", nativeQuery = true)
    void deleteByPlanId(@Param("planId") Long planId);
}
