package htmp.codien.quanlycodien.modules.asset.dto.borrow;

import java.time.LocalDateTime;

import htmp.codien.quanlycodien.modules.asset.enums.AssetBorrowStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetBorrowResponse {
    Long id;
    long assetId;
    String assetCode;
    long requestedById;
    String requestedByName;
    String requestedByCode;
    Long approvedById;
    String approvedByName;
    String approvedByCode;
    String purpose;
    AssetBorrowStatus status;
    LocalDateTime borrowAt;
    LocalDateTime expectedReturnAt;
    LocalDateTime actualReturnAt;
    LocalDateTime approvedAt;
    String remark;
}
