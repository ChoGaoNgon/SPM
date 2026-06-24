package htmp.codien.quanlycodien.modules.newmodel.product.dto;

import java.math.BigDecimal;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductMachineDTO {
    BigDecimal machineCapacityQuotation;
    BigDecimal machineCapacityTarget;
    BigDecimal machineCapacityActual;
    BigDecimal cycleTimeQuotation;
    BigDecimal cycleTimeTarget;
    BigDecimal cycleTimeActual;
    BigDecimal productWeightG;
    BigDecimal productWeightActualG;
    BigDecimal runnerWeightG;
    BigDecimal runnerWeightActualG;
    Integer cavity;
    String gateType;
    String machineRemark;
}
