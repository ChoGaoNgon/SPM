package htmp.codien.quanlycodien.modules.machine.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class MachineDetailResponse {
    long id;

    String name;

    String model;

    String serial;

    String voltage;

    String maker;

    LocalDate productionStartTime;

    LocalDate dispatchTime;

    Double electricPower;
}
