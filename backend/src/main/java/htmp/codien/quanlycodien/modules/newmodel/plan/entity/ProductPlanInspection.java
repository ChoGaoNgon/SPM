package htmp.codien.quanlycodien.modules.newmodel.plan.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.common.enums.HtmpResult;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductDelivery;
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
@Table(name = "product_plan_inspections")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductPlanInspection extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", unique = true)
    @JsonIgnore
    ProductPlan plan;

    @OneToMany(mappedBy = "inspection", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @Builder.Default
    List<ProductPlanInspectionDefectDetail> defectDetails = new ArrayList<>();

    @Column(name = "inspection_date")
    LocalDate inspectionDateActual;

    @Column(name = "inspection_deadline")
    LocalDateTime inspectionDeadline;

    @Column(name = "delay_reason", columnDefinition = "TEXT")
    String delayReason;

    @Column(name = "inspected_quantity")
    Integer inspectedQuantity;

    @Column(name = "ng_quantity")
    Integer ngQuantity;

    @Column(name = "machine_code")
    String machineCode;

    @Column(name = "received_date")
    LocalDateTime receivedDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "visual_result")
    HtmpResult visualResult;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visual_checked_by")
    @JsonIgnore
    Employee visualCheckedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "dimension_result")
    HtmpResult dimensionResult;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dimension_checked_by")
    @JsonIgnore
    Employee dimensionCheckedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "received_by_employee_id")
    @JsonIgnore
    Employee receivedByEmployee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "final_checked_by")
    @JsonIgnore
    Employee finalCheckedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "final_result")
    HtmpResult finalResult;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "factory_checked_by")
    @JsonIgnore
    Employee factoryCheckedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "factory_result")
    HtmpResult factoryResult;

    @Column(name = "file_path", length = 255)
    String filePath;

    @Column(name = "qc_note", columnDefinition = "TEXT")
    String qcNote;

    @Column(name = "allow_shipment")
    Boolean allowShipment;

    @OneToOne(mappedBy = "inspection", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    ProductDelivery productDelivery;
}
