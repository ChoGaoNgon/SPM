package htmp.codien.quanlycodien.modules.newmodel.productionLot.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionStatisticsResponse {
    private LocalDate productionDate;
    private Long totalQuantity;
    private Long totalNgQuantity;
    private Double defectRate;

    public Double getDefectRate() {
        if (totalQuantity == null || totalQuantity == 0) {
            return 0.0;
        }
        Long ngQty = totalNgQuantity != null ? totalNgQuantity : 0;
        return (ngQty.doubleValue() / totalQuantity.doubleValue()) * 100;
    }
}