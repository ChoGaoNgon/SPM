package htmp.codien.quanlycodien.modules.newmodel.statistic.projection;

import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;

public interface ProductPlanProjection {
    Long getProductId();

    String getProductCode();

    String getProductName();

    String getModelCode();

    Long getModelId();

    String getMoldCode();

    Long getPlanId();

    String getCreatedBy();

    String getPlanName();

    TypePlan getPlanType();

    String getPlanStatus();
}
