package htmp.codien.quanlycodien.modules.newmodel.mp.dto.productMP;

import java.time.LocalDate;

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
public class ProductMpHandoverRequest {
    LocalDate transferDate;
    Integer drawingVersion;

}
