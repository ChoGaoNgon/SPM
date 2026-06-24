package htmp.codien.quanlycodien.modules.report.planDowntime.dto;

import lombok.Data;

@Data
public class MachineDowntimeWrapper {
    private String machineCode;
    private String moldCode;
    private Double durationHour;
    private Double totalChangeMoldMinutes;
}