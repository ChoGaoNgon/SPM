package htmp.codien.quanlycodien.infrastructure.scheduler;

import java.time.LocalDate;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import htmp.codien.quanlycodien.modules.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AttendanceScheduler {

    private final AttendanceService attendanceService;

    @Scheduled(cron = "0 20 8,14,18,20,22 * * ?")
    public void runDailyAttendanceJob() {
        attendanceService.triggerFetchFromWindowsService();
        LocalDate today = LocalDate.now();
        List<LocalDate> datesToProcess = List.of(today.minusDays(1), today);

        for (LocalDate date : datesToProcess) {
            attendanceService.processDailyAttendance(date, null);
            System.out.println("Attendance job executed for date: " + date);
        }
    }

    @Scheduled(cron = "0 30 2 1,5,11,15,21,25 * ?", zone = "Asia/Ho_Chi_Minh")
    public void runMonthlyAttendanceJob() {
        attendanceService.triggerFetchFromWindowsService();
        LocalDate today = LocalDate.now();
        List<LocalDate> datesToProcess = List.of(LocalDate.of(today.getYear(), today.getMonth(), 1), today);

        for (LocalDate date : datesToProcess) {
            attendanceService.processDailyAttendance(date, null);
            System.out.println("Attendance job executed for date: " + date);
        }
    }
}
