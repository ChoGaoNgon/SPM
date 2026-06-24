package htmp.codien.quanlycodien.modules.newmodel.productTool.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.Product;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ToolPreparationStatus;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ToolPreparationType;

import java.time.LocalDateTime;

@Entity
@Table(name = "product_tool_preparation_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductToolPreparationItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "process_type", length = 50, nullable = false)
    ToolPreparationType processType;

    @Column(name = "tool_name", length = 255, nullable = false)
    String toolName;

    @Column(name = "quantity_required")
    Integer quantityRequired;

    @Column(name = "quantity_available")
    Integer quantityAvailable;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    ToolPreparationStatus status = ToolPreparationStatus.NOT_STARTED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsible_employee_id")
    Employee responsibleEmployee;

    @Column(name = "assigned_date")
    LocalDateTime assignedDate;

    @Column(name = "expected_completion_date")
    LocalDateTime expectedCompletionDate;

    @Column(name = "actual_completion_date")
    LocalDateTime actualCompletionDate;

    @Column(name = "completion_date")
    LocalDateTime completionDate;

    @Column(name = "remark", columnDefinition = "TEXT")
    String remark;

    @Column(name = "note", columnDefinition = "TEXT")
    String note;

    @Column(name = "deleted_at")
    LocalDateTime deletedAt;
}
