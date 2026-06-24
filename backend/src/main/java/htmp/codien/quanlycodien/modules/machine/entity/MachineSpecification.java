package htmp.codien.quanlycodien.modules.machine.entity;

import java.math.BigDecimal;

import htmp.codien.quanlycodien.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "machine_specifications")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MachineSpecification extends BaseEntity {
    @Column(name = "maker")
    String maker;

    @Column(name = "model_name")
    String modelName;

    @Column(name = "machine_type")
    String machineType;

    @Column(name = "manufacturing_date")
    String manufacturedDate;

    @Column(name = "clamping_force_ton")
    Integer clampingForceTon;

    @Column(name = "supports_auto_clamping")
    Boolean supportsAutoClamping;

    @Column(name = "supports_manual_clamping")
    Boolean supportsManualClamping;

    @Column(name = "thickness", length = 20)
    String thickness;

    @Column(name = "clamping_system_type", length = 20)
    String clampingSystemType;

    @Column(name = "screw_mm", length = 20)
    String screwMm;

    @Column(name = "shot_size_cm3")
    String shotSizeCm3;

    @Column(name = "shot_weight_g")
    String shotWeightG;

    @Column(name = "max_holding_pressure_kg_cm2")
    String maxHoldingPressureKgCm2;

    @Column(name = "max_injection_pressure_kg_cm2")
    String maxInjectionPressureKgCm2;

    @Column(name = "injection_rate_cm3_sec")
    String injectionRateCm3Sec;

    @Column(name = "injection_speed_mm_sec")
    Integer injectionSpeedMmSec;

    @Column(name = "screw_speed_rpm")
    Integer screwSpeedRpm;

    @Column(name = "plasticizing_capacity_kg_h")
    Integer plasticizingCapacityKgH;

    @Column(name = "tie_bar_space_horizontal_mm")
    Integer tieBarSpaceHorizontalMm;

    @Column(name = "tie_bar_space_vertical_mm")
    Integer tieBarSpaceVerticalMm;

    @Column(name = "platen_size_horizontal_mm")
    Integer platenSizeHorizontalMm;

    @Column(name = "platen_size_vertical_mm")
    Integer platenSizeVerticalMm;

    @Column(name = "max_daylight_mm")
    Integer maxDaylightMm;

    @Column(name = "mold_height_mm")
    Integer moldHeightMm;

    @Column(name = "min_mold_height_mm")
    Integer minMoldHeightMm;

    @Column(name = "max_mold_height_mm")
    Integer maxMoldHeightMm;

    @Column(name = "max_ejector_stroke_mm")
    Integer maxEjectorStrokeMm;

    @Column(name = "auto_clamping_system")
    Boolean autoClampingSystem;

    @Column(name = "manual_clamping_system")
    Boolean manualClampingSystem;

    @Column(name = "nozzle_inside_diameter_mm")
    Integer nozzleInsideDiameterMm;

    @Column(name = "nozzle_touch_radius_mm")
    String nozzleTouchRadiusMm;

    @Column(name = "locating_ring_diameter_mm")
    String locatingRingDiameterMm;

    @Column(name = "cooling_coupler_inch")
    String coolingCouplerInch;

    @Column(name = "hydraulic_core_count_fixed_plate")
    Integer hydraulicCoreCountFixedPlate;

    @Column(name = "hydraulic_core_count_movable_plate")
    Integer hydraulicCoreCountMovablePlate;

    @Column(name = "utilized_oil_quantity_l")
    String utilizedOilQuantityL;

    @Column(name = "electric_motor_power_kw")
    Double electricMotorPowerKw;

    @Column(name = "electric_heater_power_kw")
    Double electricHeaterPowerKw;

    @Column(name = "robot_maker")
    String robotMaker;

    @Column(name = "robot_model_name")
    String robotModelName;

    @Column(name = "robot_stroke_mm")
    String robotStrokeMm;

    @Column(name = "hot_runner_zone_count")
    Integer hotRunnerZoneCount;

    @Column(name = "hot_runner_heating_type", length = 10)
    String hotRunnerHeatingType;

    @Column(name = "hot_runner_main_voltage_v")
    Integer hotRunnerMainVoltageV;

    @Column(name = "hot_runner_solenoid_valve_voltage_v")
    Integer hotRunnerSolenoidValveVoltageV;

    @Column(name = "hot_runner_sequence_enabled")
    Boolean hotRunnerSequenceEnabled;

    @Column(name = "hot_runner_controller_pin_type", length = 50)
    String hotRunnerControllerPinType;

    @Column(name = "temperature_controller_enabled")
    Boolean temperatureControllerEnabled;

    @Column(name = "chiller_enabled")
    Boolean chillerEnabled;

    @Column(name = "chiller_capacity_rt")
    BigDecimal chillerCapacityRt;
}
