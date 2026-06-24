package htmp.codien.quanlycodien.modules.newmodel.productTool.dto;

import lombok.*;

import java.time.LocalDateTime;

import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ToolPreparationStatus;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ToolPreparationType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductToolPreparationItemDTO {
    private Long id;
    private Long productId;
    private ToolPreparationType processType;

    private String toolName;
    private Integer quantityRequired;
    private Integer quantityAvailable;

    private ToolPreparationStatus status;
    private Long responsibleEmployeeId;
    private String responsibleEmployeeName;
    private String responsibleEmployeeCode;
    private LocalDateTime assignedDate;
    private LocalDateTime expectedCompletionDate;
    private LocalDateTime actualCompletionDate;
    private LocalDateTime completionDate;
    private String remark;
    private String note;
}
