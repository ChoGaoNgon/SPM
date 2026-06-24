package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan;

import java.time.LocalDateTime;

public interface PendingSampleReceiptDto {
    Long getModelId();

    String getModelCode();

    Long getProductId();

    String getProductCode();

    Long getPlanId();

    String getPlanName();

    LocalDateTime getProductSampleSubmitDate();

}