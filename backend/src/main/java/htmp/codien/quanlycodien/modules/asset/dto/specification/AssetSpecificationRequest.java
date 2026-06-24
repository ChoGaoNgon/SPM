package htmp.codien.quanlycodien.modules.asset.dto.specification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetSpecificationRequest {
    String ram;
    String rom;
    String cpu;
    String manufacture;
    String dimension;
    Double weight;
    String color;
    String material;
    String ipAddress;
    String model;
}
