package htmp.codien.quanlycodien.infrastructure.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import htmp.codien.quanlycodien.modules.employee.service.EmployeeService;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class EmployeeScheduler {
    private final EmployeeService employeeService;

    @Scheduled(cron = "0 0 0 * * ?")
    public void runSyncEmployeeJob() {
        employeeService.syncEmployeeData();
    }
}
