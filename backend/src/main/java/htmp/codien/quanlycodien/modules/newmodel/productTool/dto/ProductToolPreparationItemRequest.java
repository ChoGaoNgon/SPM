package htmp.codien.quanlycodien.modules.newmodel.productTool.dto;

import lombok.*;

import java.time.LocalDateTime;

import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ToolPreparationStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductToolPreparationItemRequest {
    private String toolName;
    private Integer quantityRequired;
    private Integer quantityAvailable;
    private ToolPreparationStatus status;
    private LocalDateTime completionDate;
    private String note;
}
