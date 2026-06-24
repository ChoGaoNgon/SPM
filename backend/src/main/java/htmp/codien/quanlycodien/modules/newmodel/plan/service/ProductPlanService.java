package htmp.codien.quanlycodien.modules.newmodel.plan.service;

import java.time.LocalDateTime;
import java.util.List;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.MoldTrialPlanUpdateRequestForKT;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.MoldTrialPlanUpdateRequestForLOG;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.MoldTrialWeeklyStatisticsResponse;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PlanApprovalRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PlanCreationRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PlanResponse;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PlanUpdateRequestTimeRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.sendMail.SendMoldTrialPlanMailRequest;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.MoldTrialPlanListView;

public interface ProductPlanService {
        void createPlan(Long productId, PlanCreationRequest req, TypePlan typePlan);

        void updatePlan(Long id, PlanCreationRequest req);

        List<PlanResponse> getAllPlanByProductId(Long productId);

        PlanResponse getPlanById(Long id);

        void updateActualMoldTrialPlanForKT(Long id, MoldTrialPlanUpdateRequestForKT req);

        void updateActualMoldTrialPlanForLOG(Long id, MoldTrialPlanUpdateRequestForLOG req);

        void deleteProductMoldTrialPlan(Long id);

        PlanResponse getLatestMoldTrialPlanByHtmpResin(String htmpResin);

        List<String> getAllDistinctHtmpResin();

        List<String> getAllDistinctDryer();

        List<String> getAllDistinctProcessStep();

        void approveProductPlanApproval(Long planId, PlanApprovalRequest req);

        void updateMoldTrialPlanApproveResult(Long id, Boolean resultedByKT, Boolean resultedByMold,
                        Boolean resultedByNMD,
                        Boolean resultedByQC, Boolean resultedBySX);

        void sendMoldTrialPlanMail(SendMoldTrialPlanMailRequest request);

        List<MoldTrialPlanListView> searchMoldTrialPlans(LocalDateTime fromDate, LocalDateTime toDate,
                        TypePlan typePlan);

        MoldTrialWeeklyStatisticsResponse getMoldTrialWeeklyStatistics(String periodType, Integer year, Integer month,
                        Integer week);

        long countDelayLogsByPlanId(Long planId);

        void cancelPlan(Long planId, PlanCreationRequest req);

        void updateRequestTime(Long planId, PlanUpdateRequestTimeRequest request);

}
