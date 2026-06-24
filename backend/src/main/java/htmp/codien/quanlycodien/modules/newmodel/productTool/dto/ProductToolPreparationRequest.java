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
public class ProductToolPreparationRequest {
    private Long productId;
    private ToolPreparationType processType;
    private ToolPreparationStatus status;

    private Long responsibleEmployeeId;
    private LocalDateTime assignedDate;
    private LocalDateTime expectedCompletionDate;
    private LocalDateTime actualCompletionDate;

    private String remark;

    private List<ProductToolPreparationItemRequest> items;
}
