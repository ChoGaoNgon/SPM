package htmp.codien.quanlycodien.modules.newmodel.plan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanIssueFile;

public interface ProductPlanIssueFileRepository extends JpaRepository<ProductPlanIssueFile, Long> {

    @Modifying
    @Query("DELETE FROM ProductPlanIssueFile f WHERE f.issue.id = :issueId")
    void deleteAllByIssueId(@Param("issueId") Long issueId);
}
