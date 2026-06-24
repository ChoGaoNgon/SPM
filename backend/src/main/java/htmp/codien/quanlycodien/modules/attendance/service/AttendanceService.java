package htmp.codien.quanlycodien.modules.attendance.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;

import htmp.codien.quanlycodien.modules.attendance.dto.AttendanceLogDTO;
import htmp.codien.quanlycodien.modules.attendance.dto.AttendanceResponse;
import htmp.codien.quanlycodien.modules.attendance.dto.CurrentWorkingEmployeeDTO;

public interface AttendanceService {

    String triggerFetchFromWindowsService();

    String startFetchFromWindowsServiceInBackground();

    String getFetchFromWindowsJobStatus();

    String getWindowsServiceStatus();

    void processDailyAttendance(LocalDate workDate, Long employeeId);

    String processAttendanceRangeAsync(LocalDate startDate, LocalDate endDate, Long employeeId);

    String getAttendanceSyncStatus();

    public void processAttendanceForEmployee(Long employeeId, LocalDate workDate);

    AttendanceResponse fetchDailyAttendanceDataByEmployeeId(LocalDate workDate, Long employeeId);

    List<AttendanceResponse> getAttendanceDataByDepartmentId(LocalDate workDate, Long departmentId);

    List<CurrentWorkingEmployeeDTO> getCurrentlyWorkingEmployees(LocalDate workDate);

    Page<AttendanceLogDTO> getRawAttendanceLogs(Long employeeId, LocalDate startDate, LocalDate endDate, int page,
            int size);
}