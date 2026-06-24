package htmp.codien.quanlycodien.modules.machine.dto;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class MachineDetailRequest {

    String name;

    String model;

    String serial;

    String voltage;

    String maker;

    LocalDate productionStartTime;

    LocalDate dispatchTime;

    Double electricPower;

}
