package htmp.codien.quanlycodien.modules.attendance.helper;

import java.sql.Time;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Component;

import htmp.codien.quanlycodien.modules.attendance.entity.Attendance;
import htmp.codien.quanlycodien.modules.attendance.entity.AttendanceLog;
import htmp.codien.quanlycodien.modules.attendance.repository.AttendanceRepository;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.workschedule.repository.WorkScheduleRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AttendanceHelper {

    private final WorkScheduleRepository workScheduleRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;

    public ShiftInfo getShiftInfo(Long employeeId, LocalDate workDate) {
        List<Object[]> shiftData = workScheduleRepository.findShiftTimesByEmployeeAndDate(employeeId, workDate);
        if (shiftData.isEmpty())
            return null;

        Object[] row = shiftData.get(0);
        LocalTime start = ((Time) row[0]).toLocalTime();
        LocalTime end = ((Time) row[1]).toLocalTime();

        LocalDateTime shiftStart = start.atDate(workDate);
        LocalDateTime shiftEnd = end.atDate(workDate);
        Long shiftId = ((Number) row[2]).longValue();
        String shiftName = (String) row[3];

        boolean overnight = false;
        if (shiftEnd.isBefore(shiftStart)) {
            shiftEnd = shiftEnd.plusDays(1);
            overnight = true;
        }

        shiftStart = shiftStart.minusHours(5);
        shiftEnd = shiftEnd.plusHours(5);

        return new ShiftInfo(shiftName, shiftStart, shiftEnd, shiftId, overnight);
    }

    public List<LocalDateTime> getFilteredLogs(List<AttendanceLog> logs) {
        List<LocalDateTime> result = new ArrayList<>();
        logs.sort(Comparator.comparing(AttendanceLog::getLogTime));

        LocalDateTime lastAdded = null;
        for (AttendanceLog log : logs) {
            LocalDateTime time = log.getLogTime();
            if (lastAdded == null || Duration.between(lastAdded, time).toMinutes() >= 5) {
                result.add(time);
                lastAdded = time;
            }
        }
        return result;
    }

    public CheckinCheckout determineCheckinCheckout(List<LocalDateTime> logs, ShiftInfo shiftInfo) {
        if (logs == null || logs.isEmpty() || shiftInfo.start() == null || shiftInfo.end() == null) {
            return new CheckinCheckout(null, null);
        }

        if (shiftInfo.isOvernightShift()) {
            return determineOvernight(logs, shiftInfo);
        }

        logs.sort(LocalDateTime::compareTo);

        if (logs.size() == 1) {
            LocalDateTime log = logs.get(0);
            long diffStart = Math.abs(Duration.between(log, shiftInfo.start()).toMinutes());
            long diffEnd = Math.abs(Duration.between(log, shiftInfo.end()).toMinutes());

            if (diffStart <= diffEnd) {
                return new CheckinCheckout(log, null);
            } else {
                return new CheckinCheckout(null, log);
            }
        }

        LocalDateTime bestCheckin = null;
        LocalDateTime bestCheckout = null;
        long minCheckinDiff = Long.MAX_VALUE;
        long minCheckoutDiff = Long.MAX_VALUE;

        for (LocalDateTime log : logs) {
            long diffStart = Math.abs(Duration.between(log, shiftInfo.start()).toMinutes());
            long diffEnd = Math.abs(Duration.between(log, shiftInfo.end()).toMinutes());

            if (diffStart < minCheckinDiff) {
                minCheckinDiff = diffStart;
                bestCheckin = log;
            }
            if (diffEnd < minCheckoutDiff) {
                minCheckoutDiff = diffEnd;
                bestCheckout = log;
            }
        }

        if (bestCheckin != null && bestCheckout != null && bestCheckout.isBefore(bestCheckin)) {
            bestCheckin = logs.get(0);
            bestCheckout = logs.get(logs.size() - 1);
        }

        return new CheckinCheckout(bestCheckin, bestCheckout);
    }

    private CheckinCheckout determineOvernight(List<LocalDateTime> logs, ShiftInfo shiftInfo) {
        LocalDateTime checkin = logs.get(0);
        LocalDateTime checkout = logs.size() > 1 ? logs.get(logs.size() - 1) : null;
        return new CheckinCheckout(checkin, checkout);
    }

    public Attendance getOrCreateAttendance(Long employeeId, LocalDate workDate) {
        return attendanceRepository.findByEmployeeIdAndWorkDate(employeeId, workDate)
                .orElseGet(() -> {
                    Attendance a = new Attendance();
                    Employee e = employeeRepository.findById(employeeId)
                            .orElseThrow(() -> new RuntimeException("Employee not found: " + employeeId));
                    a.setEmployee(e);
                    a.setWorkDate(workDate);
                    return a;
                });
    }

    public record ShiftInfo(String name, LocalDateTime start, LocalDateTime end, Long shiftId, boolean overnight) {
        public boolean isOvernightShift() {
            return overnight;
        }
    }

    public record CheckinCheckout(LocalDateTime checkin, LocalDateTime checkout) {
    }
}
