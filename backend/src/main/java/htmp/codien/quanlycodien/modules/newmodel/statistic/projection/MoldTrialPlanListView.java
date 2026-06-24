package htmp.codien.quanlycodien.modules.newmodel.statistic.projection;

import java.time.LocalDateTime;

import htmp.codien.quanlycodien.common.enums.HtmpStatus;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;

public interface MoldTrialPlanListView {

    Long getModelId();

    String getModelCode();

    Long getProductId();

    String getProductCode();

    Long getMoldId();

    String getMoldCode();

    Long getTrialId();

    String getTrialName();

    LocalDateTime getTrialStartRequest();

    String getMachineNo();

    HtmpStatus getStatus();

    LocalDateTime getCreatedAt();

    TypePlan getTypePlan();
}
