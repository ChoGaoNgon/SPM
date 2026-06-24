package htmp.codien.quanlycodien.modules.machine.dto;

import java.math.BigDecimal;

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
public class MachineSpecificationRequest {
    String maker;
    String modelName;
    String machineType;
    String manufacturedDate;
    Integer clampingForceTon;
    Boolean supportsAutoClamping;
    Boolean supportsManualClamping;
    String thickness;
    String clampingSystemType;
    String screwMm;
    String shotSizeCm3;
    String shotWeightG;
    String maxHoldingPressureKgCm2;
    String maxInjectionPressureKgCm2;
    String injectionRateCm3Sec;
    Integer injectionSpeedMmSec;
    Integer screwSpeedRpm;
    Integer plasticizingCapacityKgH;
    Integer tieBarSpaceHorizontalMm;
    Integer tieBarSpaceVerticalMm;
    Integer platenSizeHorizontalMm;
    Integer platenSizeVerticalMm;
    Integer maxDaylightMm;
    Integer moldHeightMm;
    Integer minMoldHeightMm;
    Integer maxMoldHeightMm;
    Integer maxEjectorStrokeMm;
    Boolean autoClampingSystem;
    Boolean manualClampingSystem;
    Integer nozzleInsideDiameterMm;
    String nozzleTouchRadiusMm;
    String locatingRingDiameterMm;
    String coolingCouplerInch;
    Integer hydraulicCoreCountFixedPlate;
    Integer hydraulicCoreCountMovablePlate;
    String utilizedOilQuantityL;
    Double electricMotorPowerKw;
    Double electricHeaterPowerKw;
    String robotMaker;
    String robotModelName;
    String robotStrokeMm;
    Integer hotRunnerZoneCount;
    String hotRunnerHeatingType;
    Integer hotRunnerMainVoltageV;
    Integer hotRunnerSolenoidValveVoltageV;
    Boolean hotRunnerSequenceEnabled;
    String hotRunnerControllerPinType;
    Boolean temperatureControllerEnabled;
    Boolean chillerEnabled;
    BigDecimal chillerCapacityRt;
}
