package htmp.codien.quanlycodien.modules.attendance.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AttendanceResponse {
    Long employeeId;
    String employeeName;
    String employeeCode;
    LocalDate workDate;
    LocalDateTime checkInTime;
    LocalDateTime checkOutTime;
    String shiftName;
    int lateMinutes;
    int earlyLeaveMinutes;
    Double overTimeHours;
}