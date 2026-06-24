package htmp.codien.quanlycodien.modules.newmodel.plan.repository;

import java.util.List;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanInspectionDefectDetail;
import htmp.codien.quanlycodien.modules.newmodel.productionLot.entity.ProductionLotDefectCode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "product_defect_codes")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductDefectCode extends BaseEntity {
    @Column(name = "code", length = 50, unique = true)
    String code;

    @Column(name = "description", length = 255)
    String description;

    @OneToMany(mappedBy = "defectCode")
    private List<ProductionLotDefectCode> productionLots;

    @OneToMany(mappedBy = "defectCode")
    private List<ProductPlanInspectionDefectDetail> inspectionDefectDetails;
}
