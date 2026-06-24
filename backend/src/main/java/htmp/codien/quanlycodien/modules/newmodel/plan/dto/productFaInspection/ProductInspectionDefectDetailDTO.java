package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productFaInspection;

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
public class ProductInspectionDefectDetailDTO {
    Long id;
    Long defectCodeId;
    String defectCode;
    String defectCodeDescription;
    Integer quantity;
    String note;
}
