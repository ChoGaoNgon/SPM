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
public class AssetResponse {
    Long id;
    String name;
    String code;
    String model;
    String description;
    Long assetTypeId;
    String assetTypeName;
    Long departmentId;
    String departmentName;
    AssetAssignmentStatus status;
    LocalDate purchaseDate;
    String position;

}