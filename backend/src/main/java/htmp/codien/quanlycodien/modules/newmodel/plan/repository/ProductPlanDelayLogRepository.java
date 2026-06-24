package htmp.codien.quanlycodien.modules.newmodel.plan.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanDelayLogRespopnse;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanDelayLog;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.PlanDelayType;

@Repository
public interface ProductPlanDelayLogRepository extends JpaRepository<ProductPlanDelayLog, Long> {

	long countByPlan_Id(Long planId);

	@Query("SELECT new htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanDelayLogRespopnse(" +
			"l.id, l.plan.id, l.delayDuration, l.reason, " +
			"CASE WHEN l.delayType = htmp.codien.quanlycodien.modules.newmodel.productModel.enums.PlanDelayType.PLAN_END_TIME_DELAY THEN 'Trễ thời gian kết thúc kế hoạch' "
			+
			"     WHEN l.delayType = htmp.codien.quanlycodien.modules.newmodel.productModel.enums.PlanDelayType.FA_SUBMIT_DELAY THEN 'Trễ thời gian gửi FA' "
			+
			"     ELSE 'Không xác định' END, " +
			"l.createdBy, l.createdAt) " +
			"FROM ProductPlanDelayLog l " +
			"WHERE l.plan.id = :planId " +
			"ORDER BY l.createdAt DESC")
	List<ProductPlanDelayLogRespopnse> getDelayLogsByPlanId(Long planId);

	@Query(value = "SELECT * FROM product_plan_delay_logs WHERE plan_id = :planId AND delay_type  = :type ORDER BY created_at DESC LIMIT 1", nativeQuery = true)
	ProductPlanDelayLog findTopByStatusNative(Long planId, String type);

	@Query("SELECT d FROM ProductPlanDelayLog d WHERE d.plan.id = :planId AND d.delayType = :delayType ORDER BY d.createdAt DESC")
	List<ProductPlanDelayLog> findByPlanIdAndDelayTypeOrderByCreatedAtDesc(Long planId, PlanDelayType delayType);

	@Modifying
	void deleteByPlan_Id(Long planId);
}
