package htmp.codien.quanlycodien.infrastructure.scheduler;

import java.time.LocalDate;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import htmp.codien.quanlycodien.modules.workschedule.service.ExternalScheduleAPIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class WorkScheduleSyncScheduler {

    private final ExternalScheduleAPIService externalScheduleAPIService;

    @Scheduled(cron = "0 0 2 * * ?", zone = "Asia/Ho_Chi_Minh")
    public void autoSyncWorkSchedule() {
        try {
            LocalDate now = LocalDate.now();

            if (now.getDayOfMonth() < 10) {
                LocalDate prevMonth = now.minusMonths(1);

                externalScheduleAPIService.fetchAndSyncSchedule(
                        prevMonth.getMonthValue(),
                        prevMonth.getYear(),
                        true);
            }

            externalScheduleAPIService.fetchAndSyncSchedule(
                    now.getMonthValue(),
                    now.getYear(),
                    true);

        } catch (Exception e) {
            log.error("Auto sync work schedule failed", e);
        }
    }

}
