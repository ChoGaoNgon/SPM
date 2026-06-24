package htmp.codien.quanlycodien.modules.order.entity;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import htmp.codien.quanlycodien.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "order_items")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderItem extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnoreProperties("orderItems")
    Order order;

    @Column(name = "material_code", length = 50, nullable = false)
    String materialCode;

    @Column(name = "material_name", length = 255, nullable = false)
    String materialName;

    @Column(name = "unit", length = 20, nullable = false)
    String unit;

    @Column(name = "quantity_ordered", nullable = false)
    Double quantityOrdered;

    @Column(name = "quantity_received", nullable = false)
    Double quantityReceived;

    @Column(name = "received_date", nullable = true)
    LocalDate receivedDate;

    @Column(name = "purpose", length = 255, nullable = true)
    String purpose;

    @Column(name = "note", length = 255, nullable = true)
    String note;
}