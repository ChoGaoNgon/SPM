package htmp.codien.quanlycodien.modules.machine.service;

import java.time.LocalDate;

import htmp.codien.quanlycodien.modules.machine.dto.MachineDowntimeResponse;

public interface MachineDowntimeService {
    MachineDowntimeResponse getDailyDowntime(LocalDate date);
}
