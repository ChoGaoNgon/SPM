package htmp.codien.quanlycodien.modules.newmodel.plan.dto.ProductProgressDTO;

import java.util.List;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductProgressDto {
    Long id;
    String productCode;
    String productName;
    List<StageDto> stages;
}
