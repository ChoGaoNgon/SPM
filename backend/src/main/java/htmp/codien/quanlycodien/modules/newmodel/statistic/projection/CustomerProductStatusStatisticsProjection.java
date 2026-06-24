package htmp.codien.quanlycodien.modules.newmodel.statistic.projection;

public interface CustomerProductStatusStatisticsProjection {
    String getCustomerName();

    Long getInjectionCount();

    Long getSecondProcessCount();

    Long getFinishedCount();

    Long getTotalProducts();
}