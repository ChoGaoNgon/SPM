package htmp.codien.quanlycodien.modules.report.planDowntime.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MachineSession {

    private String phase;

    private Double startHour;

    private Double endHour;
}