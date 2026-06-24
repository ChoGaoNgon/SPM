package htmp.codien.quanlycodien.modules.asset.dto.asset;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetStatisticalResponse {
    Integer totalAssets;
    Integer totalAvailableAssets;
    Integer totalAssignedAssets;
    Integer totalMaintenanceAssets;
    Integer totalBrokenAssets;
    Integer totalLostAssets;

}
