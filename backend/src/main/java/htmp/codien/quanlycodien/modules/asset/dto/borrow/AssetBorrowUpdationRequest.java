package htmp.codien.quanlycodien.modules.asset.dto.borrow;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetBorrowUpdationRequest {
    long requestedById;
    Long approvedById;
    String purpose;
    LocalDateTime borrowAt;
    LocalDateTime expectedReturnAt;
    LocalDateTime actualReturnAt;
    LocalDateTime approvedAt;
    String remark;
}
