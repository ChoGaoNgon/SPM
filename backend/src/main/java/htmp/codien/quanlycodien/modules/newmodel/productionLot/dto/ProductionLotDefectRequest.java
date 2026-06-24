package htmp.codien.quanlycodien.modules.newmodel.productionLot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionLotDefectRequest {
    private Long defectCodeId;
    private Integer quantity;
}
