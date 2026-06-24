package htmp.codien.quanlycodien.modules.newmodel.statistic.service.nmd;

import java.util.List;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PlanSummaryDto;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductDTO;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;
import htmp.codien.quanlycodien.modules.newmodel.statistic.dto.NMDCustomerStatisticalResponse;
import htmp.codien.quanlycodien.modules.newmodel.statistic.dto.NMDEventCompanyStatisticsResponse;
import htmp.codien.quanlycodien.modules.newmodel.statistic.dto.NewmodelOverviewStatisticsDetailResponse;
import htmp.codien.quanlycodien.modules.newmodel.statistic.dto.NewmodelOverviewStatisticsPieChartResponse;

public interface NewmodelStatisticsService {
    NewmodelOverviewStatisticsPieChartResponse getOverviewPieChartStatistics();

    NewmodelOverviewStatisticsDetailResponse getProductsByPlanType(TypePlan planType);

    NMDCustomerStatisticalResponse getCustomerPlanStatistics(Integer limit);

    NMDEventCompanyStatisticsResponse getEventStatisticsByStatus(TypePlan typePlan);

    List<ProductDTO> getProductsPendingApproval();

    List<PlanSummaryDto> getPlansPendingApproval();

    List<PlanSummaryDto> getProductPlansWithNullActualFaSubmitDate();

}
