package htmp.codien.quanlycodien.modules.newmodel.productTool.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ToolPreparationStatus;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ToolPreparationType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductToolPreparationDTO {

    private Long id;
    private Long productId;
    private String productCode;
    private String productName;

    private ToolPreparationType processType;
    private String processName;
    private ToolPreparationStatus status;

    private Long responsibleEmployeeId;
    private String responsibleEmployeeName;
    private String responsibleEmployeeCode;

    private LocalDateTime assignedDate;
    private LocalDateTime expectedCompletionDate;
    private LocalDateTime actualCompletionDate;

    private String remark;

    private List<ProductToolPreparationItemDTO> items;

    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
}
