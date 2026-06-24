package htmp.codien.quanlycodien.modules.newmodel.statistic.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NMDEventPlanProductDetailDto {
    Long planId;
    String planCode;
    Long productId;
    String productCode;
    String productName;
    Long modelId;
    String modelCode;
    Long customerId;
    String customerName;
}
