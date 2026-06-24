package htmp.codien.quanlycodien.modules.newmodel.productionLot.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductionLotDefectResponse {
    Long id;
    Long defectCodeId;
    String defectCode;
    String defectDescription;
    Integer quantity;
}