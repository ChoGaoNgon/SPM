package htmp.codien.quanlycodien.modules.newmodel.plan.dto.ProductProgressDTO;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SubStepDto {
    String subStepName;
    String subStepStatus;
    String descreption;
}
