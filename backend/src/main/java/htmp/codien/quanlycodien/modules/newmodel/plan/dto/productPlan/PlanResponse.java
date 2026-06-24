package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan;

import htmp.codien.quanlycodien.common.enums.HtmpResult;
import htmp.codien.quanlycodien.common.enums.HtmpStatus;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.ProductPlanApprovalDTO;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ApproveResinStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlanResponse {

    Long id;
    Long productId;
    String productCode;
    String moldCode;
    LocalDateTime productSampleSubmitDate;
    Long productSampleSubmitterId;
    String productSampleSubmitterCode;
    String productSampleSubmitterName;

    String name;
    String typePlan;
    String costFactory;
    LocalDateTime requestStartTime;
    LocalDateTime requestEndTime; 
    LocalDateTime previousRequestStartTime;
    LocalDateTime previousRequestEndTime;
    String requestStartTimeNote;
    String requestEndTimeNote;
    String requestTimeNote;
    String requestMachineNote;
    LocalDateTime actualStartTime;
    LocalDateTime actualEndTime;
    String purpose;
    Integer sampleQuantity;
    Integer deliveryQuantity;
    String planDelayReason; 
    String faSubmitDelayReason;
    Long responsibleEmployeeId;
    String responsibleEmployeeName;
    String responsibleEmployeeCode;
    Long approvePlanByEmployeeId;
    String approvePlanByEmployeeName;
    String approvePlanByEmployeeCode;
    Long approveResinByEmployeeId;
    String approveResinByEmployeeName;
    String approveResinByEmployeeCode;
    String processStep;
    String machineCapacityTon;
    Integer quantityTrialMachine;
    Long machineId;
    String machineCode;
    String machinePosition;
    ApproveResinStatus approvedResin;
    Boolean approvedPlan;
    Boolean requestResinFromPC; 
    String dryingTemperature;
    String dryingTemperatureActual;
    String dryer;
    String dryingTime;
    String dryingTimeActual; 
    String screwTemperature;
    String screwTemperatureActual; 
    String tryNo; 
    List<ProductPlanResinResponse> plastics;
    List<ProductPlanSupplyResponse> supplies;
    LocalDateTime actualFaSubmitDate;
    LocalDateTime expectedFaSubmitDate;
    HtmpResult result;
    String remark;
    HtmpStatus status;
    String statusDescription;
    String statusColor;
    String createdBy;
    String createdByCode;
    String createdByName;
    LocalDateTime createdAt;
    Double numberOfPeople;
    String remarkApprovedResin;
    String remarkApprovedPlan;
    HtmpResult overallApproveResult;
    Long machineNo;
    Boolean isUnusual;
    List<ProductPlanApprovalDTO> approvals;
}
