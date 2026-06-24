package htmp.codien.quanlycodien.modules.asset.dto.assignment;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetAssignmentCreationRequest {
    Long assetId;
    Long employeeUseId;
    Long departmentUseId;
    LocalDate assignAt;
}
