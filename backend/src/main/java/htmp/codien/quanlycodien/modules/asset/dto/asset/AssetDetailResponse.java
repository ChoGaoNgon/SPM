package htmp.codien.quanlycodien.modules.asset.dto.asset;

import java.time.LocalDate;

import htmp.codien.quanlycodien.modules.asset.dto.assignment.AssetAssignmentResponse;
import htmp.codien.quanlycodien.modules.asset.dto.specification.AssetSpecificationResponse;
import htmp.codien.quanlycodien.modules.asset.dto.type.AssetTypeResponse;
import htmp.codien.quanlycodien.modules.asset.enums.AssetAssignmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetDetailResponse {
    Long id;
    String name;
    String code;
    String description;
    String model;
    LocalDate purchaseDate;
    String position;
    AssetAssignmentStatus status;
    AssetTypeResponse assetType;
    String assetTypeName;
    Long departmentId;
    String departmentName;
    AssetSpecificationResponse specification;
    AssetAssignmentResponse assignment;
}
