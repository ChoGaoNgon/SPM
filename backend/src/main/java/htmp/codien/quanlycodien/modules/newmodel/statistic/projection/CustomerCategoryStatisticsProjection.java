package htmp.codien.quanlycodien.modules.newmodel.statistic.projection;

public interface CustomerCategoryStatisticsProjection {
    Long getCustomerId();

    String getCustomerName();

    String getProductCategory();

    Long getTotalProducts();

    Long getTotalPlans();
}