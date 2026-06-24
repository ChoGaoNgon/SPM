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
public class BomListResponse {
    Long id;
    Long modelId;
    String phase;
    Integer version;
    String fileUrl;
    HtmpResult checkResult;
    Long checkedById;
    String checkedByCode;
    String checkedByName;
    LocalDateTime checkAt;
    String content;
    Boolean isApprove;
    LocalDateTime approvalAt;
    Long approvedById;
    String approvedByCode;
    String approvedByName;
}
