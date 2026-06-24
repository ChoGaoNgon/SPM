package htmp.codien.quanlycodien.modules.newmodel.plan.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanIssue;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.IssueType;

public interface ProductPlanIssueRepository extends JpaRepository<ProductPlanIssue, Long> {
    List<ProductPlanIssue> findByPlan_Id(Long moldTrialPlanId);

    List<ProductPlanIssue> findByPlan_Product_Mold_IdAndIssueType(Long moldId, IssueType issueType);

    @Modifying
    @Query("DELETE FROM ProductPlanIssue f WHERE f.plan.id = :planId")
    void deleteAllByPlanId(@Param("planId") Long planId);

    @Query(value = """
            SELECT
                ppi.id,
                p.code,
                pp.name AS plan_name,
                ppi.issue_description,
                ppi.cause,
                ppi.improve_plan,
                ppi.is_implemented,
                ppi.created_at,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', ppif.id,
                        'filePath', CONVERT(ppif.file_path USING utf8mb4)
                    )
                ) AS files
            FROM product_plan_issues ppi
            JOIN product_plans pp ON pp.id = ppi.plan_id
            JOIN products p ON p.id = pp.product_id
            LEFT JOIN product_plan_issue_files ppif ON ppif.issue_id = ppi.id
            GROUP BY ppi.id
            ORDER BY ppi.created_at DESC
            """, nativeQuery = true)
    List<Object[]> findAllIssues();

}
