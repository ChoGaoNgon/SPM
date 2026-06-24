package htmp.codien.quanlycodien.modules.newmodel.statistic.projection;

import htmp.codien.quanlycodien.modules.customer.entity.Customer;

public interface CustomerPlanStatisticsProjection {
    Customer getCustomer();

    Long getTotalPlans();
}
