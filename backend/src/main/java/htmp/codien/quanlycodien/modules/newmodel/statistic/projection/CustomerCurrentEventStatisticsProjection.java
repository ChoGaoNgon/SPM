package htmp.codien.quanlycodien.modules.newmodel.statistic.projection;

public interface CustomerCurrentEventStatisticsProjection {
    Long getCustomerId();

    String getCustomerName();

    Integer getEventNo();

    Long getProductCount();
}