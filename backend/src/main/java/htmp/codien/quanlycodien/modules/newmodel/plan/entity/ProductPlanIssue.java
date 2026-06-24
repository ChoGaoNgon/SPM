package htmp.codien.quanlycodien.modules.newmodel.plan.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.IssueType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "product_plan_issues")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductPlanIssue extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    @JsonIgnore
    ProductPlan plan;

    @Enumerated(EnumType.STRING)
    @Column(name = "issue_type", length = 50)
    IssueType issueType;

    @Column(name = "issue_description", columnDefinition = "TEXT")
    String issueDescription;

    @Column(columnDefinition = "TEXT")
    String cause;

    @Column(name = "improve_plan", columnDefinition = "TEXT")
    String improvePlan;
    @Column(name = "repair_deadline")
    LocalDateTime repairDeadline;

    @Column(name = "is_implemented", nullable = false)
    @Builder.Default
    Boolean implemented = false;

    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    List<ProductPlanIssueFile> files = new ArrayList<>();

    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    List<ProductPlanIssueDefectCode> defectCodes = new ArrayList<>();

    @PrePersist
    @PreUpdate
    private void applyDefaultValues() {
        if (implemented == null) {
            implemented = false;
        }
    }
}
