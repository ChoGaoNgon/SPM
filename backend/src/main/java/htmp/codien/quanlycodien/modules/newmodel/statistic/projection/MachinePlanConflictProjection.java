package htmp.codien.quanlycodien.modules.newmodel.statistic.projection;

import java.time.LocalDateTime;

public interface MachinePlanConflictProjection {
    Long getPlanId();

    String getPlanName();

    Long getProductId();

    String getProductCode();

    String getProductName();

    LocalDateTime getConflictStartTime();

    LocalDateTime getConflictEndTime();
}
