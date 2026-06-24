package htmp.codien.quanlycodien.modules.workschedule.helper;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import htmp.codien.quanlycodien.common.exception.ConflictException;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.enums.EmployeeType;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.WorkDayDTO;
import htmp.codien.quanlycodien.modules.workschedule.entity.OvertimeRequest;
import htmp.codien.quanlycodien.modules.workschedule.entity.Shift;
import htmp.codien.quanlycodien.modules.workschedule.entity.WorkSchedule;
import htmp.codien.quanlycodien.modules.workschedule.repository.ShiftRepository;
import htmp.codien.quanlycodien.modules.workschedule.repository.WorkScheduleRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OvertimeHelper {

    private final EmployeeRepository employeeRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final ShiftRepository shiftRepository;

    public String detectOvertimeCode(Long employeeId, LocalDateTime startTime, LocalDateTime endTime) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy employee"));

        boolean isIndirect = employee.getEmployeeType() == EmployeeType.INDIRECT;

        LocalDate date = startTime.toLocalDate();
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        int startHour = startTime.getHour();
        Duration duration = Duration.between(startTime, endTime);

        WorkDayDTO present = findWorkDay(employeeId, date);
        String presentCode = present != null ? present.getShiftCode() : "";

        if (!presentCode.equalsIgnoreCase("NT")) {
            throw new ConflictException("Bạn đang gửi yêu tăng ca vào ngày có lịch đi làm");
        }

        if (isIndirect) {
            return dayOfWeek == DayOfWeek.SUNDAY ? "HC200" : "HC150";
        }

        if (dayOfWeek == DayOfWeek.SUNDAY) {
            boolean kip6 = isKip6(employeeId, date);

            if (kip6) {
                return detectCodeByTime(startHour, duration, true);
            }
        }

        WorkDayDTO prev = findWorkDay(employeeId, date.minusDays(1));
        WorkDayDTO next = findWorkDay(employeeId, date.plusDays(1));

        String prevCode = prev != null ? prev.getShiftCode() : "";
        String nextCode = next != null ? next.getShiftCode() : "";

        boolean isTodayNT = "NT".equalsIgnoreCase(presentCode);

        if (isTodayNT) {

            if ("NT".equalsIgnoreCase(nextCode)) {
                return detectCodeByTime(startHour, duration, false);
            }

            if ("NT".equalsIgnoreCase(prevCode)) {
                return detectCodeByTime(startHour, duration, false);
            }

            if (prevCode.endsWith("150")) {
                return detectCodeByTime(startHour, duration, true);
            }
        }

        return detectCodeByTime(startHour, duration, false);
    }

    private String detectCodeByTime(int startHour, Duration duration, boolean is200) {

        boolean longShift = duration.toHours() > 8;

        if (startHour >= 18) {
            return is200 ? "KD200" : "KD150";
        }

        if (startHour < 8) {
            return is200 ? "KO200" : "KO150";
        }

        if (!longShift) {
            return is200 ? "HC200" : "HC150";
        }

        return is200 ? "KO200" : "KO150";
    }

    private boolean isKip6(Long employeeId, LocalDate date) {
        for (int i = 1; i <= 6; i++) {
            WorkDayDTO d = findWorkDay(employeeId, date.minusDays(i));
            String code = d != null ? d.getShiftCode() : "";
            if (!(code.startsWith("KO") || code.startsWith("KD")
                    || code.equalsIgnoreCase("P")
                    || code.equalsIgnoreCase("NKL")
                    || code.equalsIgnoreCase("L")
                    || code.equalsIgnoreCase("PL"))) {
                return false;
            }
        }

        WorkDayDTO prev = findWorkDay(employeeId, date.minusDays(1));
        WorkDayDTO next = findWorkDay(employeeId, date.plusDays(1));

        String prevCode = prev != null ? prev.getShiftCode() : "";
        String nextCode = next != null ? next.getShiftCode() : "";

        if ("NT".equalsIgnoreCase(prevCode) || "NT".equalsIgnoreCase(nextCode)) {
            return false;
        }
        return true;
    }

    public WorkDayDTO findWorkDay(Long employeeId, LocalDate date) {
        Object result = workScheduleRepository.findByWorkDateNative(employeeId, date);
        if (result == null)
            return null;

        Object[] row = (Object[]) result;
        return new WorkDayDTO(
                ((java.sql.Date) row[0]).toLocalDate(),
                (String) row[1]);
    }

    public LocalDateTime roundStartUpToNextHour(LocalDateTime time) {
        if (time.getMinute() == 0) {
            return time.withSecond(0).withNano(0);
        }
        return time.plusHours(1)
                .withMinute(0)
                .withSecond(0)
                .withNano(0);
    }

    public LocalDateTime roundEndDown(LocalDateTime time, EmployeeType employeeType) {
        int minute = time.getMinute();
        int roundedMinute;

        switch (employeeType) {
            case DIRECT -> roundedMinute = (minute < 30) ? 0 : 30;
            case INDIRECT -> {
                if (minute < 15)
                    roundedMinute = 0;
                else if (minute < 30)
                    roundedMinute = 15;
                else if (minute < 45)
                    roundedMinute = 30;
                else
                    roundedMinute = 45;
            }
            default -> roundedMinute = minute;
        }

        return time.withMinute(roundedMinute).withSecond(0).withNano(0);
    }

    public OvertimeRequest updateOvertimeRequest(OvertimeRequest request,
            LocalDateTime checkIn,
            LocalDateTime checkOut) {

        LocalDateTime actualStart = null;
        LocalDateTime actualEnd = null;

        if (checkIn != null) {
            actualStart = roundStartUpToNextHour(checkIn);
        }

        if (checkOut != null) {
            actualEnd = roundEndDown(checkOut, request.getEmployee().getEmployeeType());
        }

        request.setActualStartTime(checkIn);
        request.setActualEndTime(checkOut);
        request.setStartTime(actualStart);
        request.setEndTime(actualEnd);

        return request;
    }

    public WorkSchedule updateShiftFromActualOvertime(OvertimeRequest request) {

        if (request.getActualStartTime() == null || request.getActualEndTime() == null) {
            return null;
        }

        LocalDateTime start = request.getActualStartTime();
        LocalDateTime end = request.getActualEndTime();
        Duration duration = Duration.between(start, end);
        int startHour = start.getHour();

        WorkSchedule workSchedule = workScheduleRepository.findByEmployee_IdAndWorkDate(
                request.getEmployee().getId(),
                request.getWorkDate()).orElse(null);

        String originalCode = workSchedule.getShift().getShiftCode();
        String suffix = "150";
        if (originalCode != null && (originalCode.endsWith("150") || originalCode.endsWith("200"))) {
            suffix = originalCode.substring(originalCode.length() - 3);
        }

        String newCode;

        if (startHour >= 18) {
            newCode = "KD" + suffix;
        }

        else if (startHour < 8) {
            newCode = "KO" + suffix;
        }

        else {

            newCode = duration.toHours() > 8 ? "KO" + suffix : "HC" + suffix;
        }

        Shift shift = shiftRepository.findByShiftCode(newCode).orElse(null);
        workSchedule.setShift(shift);
        return workSchedule;
    }

}
