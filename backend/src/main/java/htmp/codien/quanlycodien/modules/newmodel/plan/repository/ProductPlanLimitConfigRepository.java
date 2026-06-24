package htmp.codien.quanlycodien.modules.newmodel.plan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanLimitConfig;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductPlanScopeType;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;

@Repository
public interface ProductPlanLimitConfigRepository extends JpaRepository<ProductPlanLimitConfig, Long> {
    boolean existsByScopeTypeAndDepartmentIdAndTypePlan(ProductPlanScopeType scopeType, Long departmentId,
            TypePlan typePlan);

    @Query(value = """
            SELECT COALESCE(pplc_self.max_plan, pplc_parent.max_plan, 0)
            FROM employees e1
            JOIN departments d1 ON d1.id = e1.department_id
            LEFT JOIN departments d2 ON d2.id = d1.parent_department_id
            LEFT JOIN product_plan_limit_config pplc_self
              ON pplc_self.department_id = d1.id
               AND pplc_self.scope_type = 'DEPARTMENT'
               AND pplc_self.type_plan = :typePlan
            LEFT JOIN product_plan_limit_config pplc_parent
              ON pplc_parent.department_id = d2.id
               AND pplc_parent.scope_type = 'DEPARTMENT'
               AND pplc_parent.type_plan = :typePlan
            WHERE e1.id = :employeeId
            LIMIT 1
                  """, nativeQuery = true)
    Integer findMaxPlanByScopeTypeAndEmployee(
            @Param("employeeId") Long employeeId,
            @Param("typePlan") String typePlan);

    @Query("""
                SELECT p.maxPlan
                FROM ProductPlanLimitConfig p
                WHERE p.scopeType = :scopeType
                  AND p.typePlan = :typePlan
            """)
    Integer findMaxPlanByScopeType(
            @Param("scopeType") ProductPlanScopeType scopeType,
            @Param("typePlan") TypePlan typePlan);
}
