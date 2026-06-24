package htmp.codien.quanlycodien.modules.newmodel.mp.dto.productMpDepartmentChek;

import java.util.List;

import htmp.codien.quanlycodien.common.enums.HtmpResult;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.MPTypeCheck;
import htmp.codien.quanlycodien.modules.workschedule.enums.WorkRequestStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductMpCheckResponse {
    Long id;
    Long mpHandoverId;
    MPTypeCheck typeCheck;
    HtmpResult result;
    WorkRequestStatus status;
    String remark;
    List<String> filePaths;
}
