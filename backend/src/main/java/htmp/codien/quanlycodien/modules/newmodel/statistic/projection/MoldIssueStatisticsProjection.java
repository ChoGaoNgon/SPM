package htmp.codien.quanlycodien.modules.newmodel.statistic.projection;

public interface MoldIssueStatisticsProjection {
    Long getMoldId();

    String getMoldCode();

    Long getTotalProducts();

    Long getTotalIssues();

    Long getCompletedIssues();

    Long getPendingIssues();

    Long getPendingIssuesWithoutCause();

    Long getPendingIssuesWithoutImprovePlan();
}
