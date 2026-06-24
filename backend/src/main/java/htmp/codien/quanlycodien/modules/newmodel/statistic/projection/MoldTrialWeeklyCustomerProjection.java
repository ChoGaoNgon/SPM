package htmp.codien.quanlycodien.modules.newmodel.statistic.projection;

public interface MoldTrialWeeklyCustomerProjection {
    Long getCustomerId();

    String getCustomerName();

    Long getTotalMoldTrials();

    Long getOkMoldTrials();

    Long getNgMoldTrials();
}