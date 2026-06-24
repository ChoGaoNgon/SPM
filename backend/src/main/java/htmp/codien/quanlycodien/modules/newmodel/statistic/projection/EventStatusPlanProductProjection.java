package htmp.codien.quanlycodien.modules.newmodel.statistic.projection;

public interface EventStatusPlanProductProjection {
    Integer getEventNo();

    String getStatus();

    Long getPlanId();

    String getPlanCode();

    Long getProductId();

    String getProductCode();

    String getProductName();

    Long getModelId();

    String getModelCode();

    Long getCustomerId();

    String getCustomerName();
}
