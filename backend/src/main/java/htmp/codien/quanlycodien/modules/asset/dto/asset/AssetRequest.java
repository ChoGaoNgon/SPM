package htmp.codien.quanlycodien.modules.asset.dto.asset;

import java.time.LocalDate;

import htmp.codien.quanlycodien.modules.asset.enums.AssetAssignmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetRequest {
    String name;
    String code;
    String description;
    Long assetTypeId;
    Long departmentId;
    AssetAssignmentStatus status;
    LocalDate purchaseDate;
    String position;
    String model;
}
