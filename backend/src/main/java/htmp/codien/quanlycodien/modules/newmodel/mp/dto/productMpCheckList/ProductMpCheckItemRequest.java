package htmp.codien.quanlycodien.modules.newmodel.mp.dto.productMpCheckList;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductMpCheckItemRequest {
    Long employeeResponsibility1Id;
    String resultByResponsibility1;
    Long employeeResponsibility2Id;
    String resultByResponsibility2;
    String remark;
}
