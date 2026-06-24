package htmp.codien.quanlycodien.modules.newmodel.plan.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.common.enums.HtmpResult;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanInspection;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
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
@Table(name = "product_deliveries")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductDelivery extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id")
    ProductPlanInspection inspection;

    @Column(name = "delivery_date")
    LocalDate deliveryDate;

    @Column(name = "delivery_quantity")
    Integer deliveryQuantity;

    @Column(name = "delivery_note", columnDefinition = "TEXT")
    String deliveryNote;

    @Column(name = "feedback_date")
    LocalDate feedbackDate;

    @Column(name = "feedback_comment", columnDefinition = "TEXT")
    String feedbackComment;

    @Column(name = "feedback_file_url", length = 255)
    String feedbackFileUrl;

    @Column(name = "feedback_result", length = 10)
    @Enumerated(EnumType.STRING)
    HtmpResult feedbackResult;

    @Column(name = "condition_file_url", length = 255)
    String conditionFileUrl;

    @Column(name = "condition_file_approval_result", length = 20)
    @Enumerated(EnumType.STRING)
    HtmpResult conditionFileApprovalResult;

    @Column(name = "condition_file_approved_by", length = 50)
    String conditionFileApprovedBy;

    @Column(name = "condition_file_approved_at")
    LocalDateTime conditionFileApprovedAt;

    @Column(name = "condition_file_approval_note", columnDefinition = "TEXT")
    String conditionFileApprovalNote;

}
