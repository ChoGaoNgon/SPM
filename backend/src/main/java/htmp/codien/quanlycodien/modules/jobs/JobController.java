package htmp.codien.quanlycodien.modules.jobs;

import htmp.codien.quanlycodien.infrastructure.scheduler.AttendanceScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final AttendanceScheduler attendanceScheduler;

    @PostMapping("/attendance/daily")
    public ResponseEntity<String> runDailyAttendanceJob() {

        attendanceScheduler.runDailyAttendanceJob();

        return ResponseEntity.ok("Daily attendance job executed successfully.");
    }
}
