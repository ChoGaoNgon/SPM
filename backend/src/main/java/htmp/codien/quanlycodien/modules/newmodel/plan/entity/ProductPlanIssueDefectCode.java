package htmp.codien.quanlycodien.modules.newmodel.plan.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductDefectCode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "product_plan_issue_defect_codes")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductPlanIssueDefectCode extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    @JsonIgnore
    ProductPlanIssue issue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "defect_code_id", nullable = false)
    @JsonIgnore
    ProductDefectCode defectCode;

    @Column(name = "quantity", nullable = false)
    Integer quantity;
    @Column(name = "note", columnDefinition = "TEXT")
    String note;
}
