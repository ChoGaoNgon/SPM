package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productDefectCode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDefectCodeDTO {
    Long id;
    String code;
    String name;
    String description;
}
