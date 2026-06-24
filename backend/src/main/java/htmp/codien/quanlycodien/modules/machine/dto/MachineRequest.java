package htmp.codien.quanlycodien.modules.machine.dto;

import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MachineRequest {
    String code;
    Long machineNo;
    String dimension;

    Long machineTypeId;
    Long machineSpecificationId;
    String capacityTon;
    String description;
    String position;
    String totalElectricPower;
    List<MachineDetailRequest> machineDetails;
    String screw;
}
