package htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.ProductEventProductionLog;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductEventProductionLogResponse {
    Long eventId;
    Long id;
    LocalDate productionDate;
    Integer actualOutput;
    String defectType;
    Integer defectQuantity;
    BigDecimal defectRate;
    String remark;
}
