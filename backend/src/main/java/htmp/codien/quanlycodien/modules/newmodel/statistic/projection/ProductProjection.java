package htmp.codien.quanlycodien.modules.newmodel.statistic.projection;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface ProductProjection {
    Long getId();

    String getCode();

    String getName();

    String getModelCode();

    Long getModelId();

    String getMoldCode();

    String getGateType();

    String getImage();

    String getNmdInfoStatus();

    LocalDate getInfoReceivedDate();

    LocalDateTime getCreatedAt();

    String getMpDelayReason();
}