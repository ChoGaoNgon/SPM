package htmp.codien.quanlycodien.modules.newmodel.plan.entity;

import htmp.codien.quanlycodien.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "product_plan_resin_mapping")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ProductPlanResinMapping extends BaseEntity {

    @Column(name = "resin_code", nullable = false, length = 50)
    String resinCode;

    Boolean isRecycle;
    Double plasticExpectedWeight; 
    Double plasticActualWeight; 

    @Column(name = "remark", columnDefinition = "TEXT")
    String remark;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_plan_id", nullable = false)
    ProductPlan plan;
}
