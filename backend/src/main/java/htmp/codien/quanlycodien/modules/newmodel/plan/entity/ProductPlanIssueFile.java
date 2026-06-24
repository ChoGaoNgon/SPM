package htmp.codien.quanlycodien.modules.newmodel.plan.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.IssueStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "product_plan_issue_files")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductPlanIssueFile extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    @JsonIgnore
    ProductPlanIssue issue;

    @Column(name = "file_path", length = 255)
    String filePath;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    IssueStatus status;

    @Column(columnDefinition = "TEXT")
    String remark;
}
