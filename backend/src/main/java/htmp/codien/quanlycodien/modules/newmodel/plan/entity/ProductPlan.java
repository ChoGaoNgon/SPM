package htmp.codien.quanlycodien.modules.newmodel.plan.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.common.enums.HtmpStatus;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.machine.entity.Machine;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.Product;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.entity.ProductEventDelivery;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.entity.ProductEventProductionLog;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.entity.ProductEventQcCheck;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "product_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductPlan extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @JsonIgnore
    Product product;

    @Column(name = "name", length = 50)
    String name;

    @Column(name = "cost_factory", length = 255)
    String costFactory;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_plan", length = 50)
    TypePlan typePlan;

    @Column(name = "try_no")
    String tryNo;

    LocalDateTime requestStartTime;

    String requestTimeNote;

    @Column(name = "request_start_time_note")
    String legacyRequestStartTimeNote;

    LocalDateTime requestEndTime;

    @Column(name = "request_end_time_note")
    String legacyRequestEndTimeNote;

    String requestMachineNote;

    LocalDateTime actualStartTime;

    LocalDateTime actualEndTime;

    @Column(name = "purpose", length = 255)
    String purpose;

    @Column(name = "sample_quantity")
    Integer sampleQuantity;

    @Column(name = "delivery_quantity")
    Integer deliveryQuantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsible_employee_id")
    @JsonIgnore
    Employee responsibleEmployee;

    @Column(name = "process_step", length = 100)
    String processStep;

    @Column(name = "machine_capacity_ton", precision = 10, scale = 2)
    String machineCapacityTon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id")
    @JsonIgnore
    Machine machine;

    @Column(name = "machine_no")
    Long machineNo;

    @Column(name = "resin_code", length = 100)
    String resinCode;

    @Column(name = "resin_grade", length = 100)
    String resinGrade;

    @Column(name = "resin_color", length = 100)
    String resinColor;

    @Column(name = "drying_temperature", precision = 10, scale = 2)
    String dryingTemperature;

    @Column(name = "drying_temperature_actual", precision = 10, scale = 2)
    String dryingTemperatureActual;

    @Column(name = "dryer")
    String dryer;

    @Column(name = "drying_time", precision = 10, scale = 2)
    String dryingTime;

    @Column(name = "drying_time_actual", precision = 10, scale = 2)
    String dryingTimeActual;

    @Column(name = "screw_temperature", precision = 10, scale = 2)
    String screwTemperature;
    @Column(name = "screw_temperature_actual", precision = 10, scale = 2)
    String screwTemperatureActual;

    @Column(name = "expected_fa_submit_date")
    LocalDateTime expectedFaSubmitDate;

    @Column(name = "actual_fa_submit_date")
    LocalDateTime actualFaSubmitDate;

    @Column(name = "product_sample_submit_date")
    LocalDateTime productSampleSubmitDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_sample_submitter_id")
    Employee productSampleSubmitter;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30)
    @Builder.Default
    HtmpStatus status = HtmpStatus.PLANNED;

    @OneToMany(mappedBy = "plan", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    List<ProductPlanApproveResult> approveResults;

    @Column(columnDefinition = "TEXT")
    String remark;

    @Column(name = "HTMP_resin")
    String htmpResin;

    @Column(name = "number_of_people")
    Double numberOfPeople;

    @Column(name = "request_resin_from_pc")
    @Builder.Default
    Boolean requestResinFromPC = false;

    @Column(name = "is_unusual")
    @Builder.Default
    Boolean isUnusual = false;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<ProductPlanDelayLog> delayLogs = new ArrayList<>();

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<ProductPlanApproval> approvals = new ArrayList<>();

    @OneToMany(mappedBy = "plan", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<ProductPlanIssue> issues = new ArrayList<>();

    @OneToOne(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    ProductPlanInspection inspections;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<ProductEventProductionLog> productEventProductionLogs = new ArrayList<>();

    @OneToOne(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    ProductEventQcCheck productEventQcCheck;

    @OneToOne(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    ProductEventDelivery productEventDelivery;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    List<ProductPlanResinMapping> productPlanResins = new ArrayList<>();

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    List<ProductPlanSupplyMapping> productPlanSupplies = new ArrayList<>();
}
