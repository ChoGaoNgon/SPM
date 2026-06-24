package htmp.codien.quanlycodien.modules.newmodel.bomlist.dto;

import java.time.LocalDateTime;

import htmp.codien.quanlycodien.common.enums.HtmpResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BomListRequest {
    String phase;
    Integer version;
    HtmpResult checkResult;
    Long checkedById;
    LocalDateTime checkAt;
}
