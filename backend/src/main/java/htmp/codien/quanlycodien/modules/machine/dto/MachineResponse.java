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
public class MachineResponse {
    Long id;
    String code;
    String name;
    Long machineNo;
    String dimension;

    MachineTypeResponse machineType;
    String capacityTon;
    String description;
    String position;
    String totalElectricPower;
    List<MachineDetailResponse> machineDetails;
    String screw;

    MachineSpecificationResponse machineSpecification;
}
