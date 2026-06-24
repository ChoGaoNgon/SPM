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
public class AssetBorrowCreationRequest {
    long requestedById;
    String purpose;
    LocalDateTime borrowAt;
    LocalDateTime expectedReturnAt;
    String remark;
}
//