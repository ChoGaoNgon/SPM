package htmp.codien.quanlycodien.modules.newmodel.productEvent.entity;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;
import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "product_event_delivery")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductEventDelivery extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    @JsonIgnore
    ProductPlan plan;

    LocalDate expectedDeliveryDate;
    LocalDate actualDeliveryDate;
    Integer actualQuantityDelivery;
    String feedbackRemark;
    String feedbackResult;

}
