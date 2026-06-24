package htmp.codien.quanlycodien.modules.asset.dto.type;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetTypeResponse {
    Long id;
    String name;
    String description;
    Long assetCount;
}