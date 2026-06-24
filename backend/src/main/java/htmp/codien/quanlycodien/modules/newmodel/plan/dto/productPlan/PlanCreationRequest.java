package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan;

import java.time.LocalDateTime;
import java.util.List;

import htmp.codien.quanlycodien.modules.newmodel.productEvent.entity.ProductEventProductionLog;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlanCreationRequest {

    String name;

    String costFactory;
    LocalDateTime requestStartTime;
    LocalDateTime requestEndTime;
    Long responsibleEmployeeId;
    Integer sampleQuantity;
    Integer deliveryQuantity;
    String processStep;
    String machineCapacityTon;
    String resinGrade;
    Long machineId;
    String htmpResin;
    Double numberOfPeople;
    String resinColor;
    String resinCode;
    String dryingTemperature;
    String dryer;
    String dryingTime;
    String screwTemperature;
    String dryingTemperatureActual;
    String dryingTimeActual;
    String screwTemperatureActual;
    String tryNo;
    List<ProductPlanResinRequest> plastics;
    List<ProductPlanSupplyRequest> supplies;
    String purpose;
    LocalDateTime expectedFaSubmitDate;

    ProductEventProductionLog productionLog;

    String remark;

    Boolean requestResinFromPC;

}
