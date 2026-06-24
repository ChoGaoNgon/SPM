package htmp.codien.quanlycodien.modules.newmodel.mp.dto.productMP;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductMpHandoverResponse {
    Long id;
    Long productId;
    String processName;
    Integer faVersion;
    BigDecimal quotationMachineCapacity;
    Integer drawingVersion;
    LocalDate transferDate;
    String createdBy;
    String createdByName;
    LocalDateTime createdAt;
}
