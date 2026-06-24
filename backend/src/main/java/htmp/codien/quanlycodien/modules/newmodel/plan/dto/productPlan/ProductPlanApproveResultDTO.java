package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

import htmp.codien.quanlycodien.common.enums.HtmpResult;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductPlanApproveResultDTO {

    Long id;
    Long planId;
    String departmentCode;
    HtmpResult result;
    String comment;
    String approvedByCode;
    String approvedByName;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

}
