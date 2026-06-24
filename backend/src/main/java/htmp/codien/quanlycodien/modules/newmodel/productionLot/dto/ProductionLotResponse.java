package htmp.codien.quanlycodien.modules.newmodel.productionLot.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import htmp.codien.quanlycodien.common.enums.HtmpResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionLotResponse {
    private Long id;
    private Integer quantity;
    private Integer ngQuantity;
    private LocalDate productionDate;
    private HtmpResult qcCheckResult;
    private List<ProductionLotDefectResponse> defectDetails;
    private EmployeeInfo checkedBy;
    private ProductPlanInfo productPlan;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EmployeeInfo {
        private Long id;
        private String name;
        private String code;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductPlanInfo {
        private Long id;
        private String planName;
        private String productCode;
        private String productName;
    }
}