package htmp.codien.quanlycodien.modules.attendance.controller;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.attendance.dto.AttendanceLogDTO;
import htmp.codien.quanlycodien.modules.attendance.dto.AttendanceResponse;
import htmp.codien.quanlycodien.modules.attendance.dto.CurrentWorkingEmployeeDTO;
import htmp.codien.quanlycodien.modules.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceService attendanceService;

    @GetMapping("/fetch-windows")
    public ResponseEntity<ApiResponse<String>> fetchFromWindowsService() {
        String result = attendanceService.startFetchFromWindowsServiceInBackground();
        return ResponseUtil.success(null, result);
    }

    @GetMapping("/fetch-windows-job-status")
    public ResponseEntity<ApiResponse<String>> getFetchFromWindowsJobStatus() {
        String status = attendanceService.getFetchFromWindowsJobStatus();
        return ResponseUtil.success(null, status);
    }

    @GetMapping("/status-windows")
    public ResponseEntity<ApiResponse<String>> getWindowsServiceStatus() {
        String status = attendanceService.getWindowsServiceStatus();
        return ResponseUtil.success(null, status);
    }

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<String>> syncAttendance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long employeeId) {

        if (endDate.isBefore(startDate)) {
            return ResponseUtil.badRequest("Ngày kết thúc phải >= ngày bắt đầu");
        }

        String result = attendanceService.processAttendanceRangeAsync(startDate, endDate, employeeId);
        return ResponseUtil.success(null, result);
    }

    @GetMapping("/sync-status")
    public ResponseEntity<ApiResponse<String>> getAttendanceSyncStatus() {
        String status = attendanceService.getAttendanceSyncStatus();
        return ResponseUtil.success(null, status);
    }

    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<Object>> getDailyAttendance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate workDate,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long departmentId) {

        if (employeeId != null) {
            AttendanceResponse response = attendanceService.fetchDailyAttendanceDataByEmployeeId(workDate, employeeId);
            return ResponseUtil.success((Object) response, "Lấy dữ liệu chấm công theo nhân viên thành công.");
        } else if (departmentId != null) {
            List<AttendanceResponse> responses = attendanceService.getAttendanceDataByDepartmentId(workDate,
                    departmentId);
            return ResponseUtil.success((Object) responses, "Lấy dữ liệu chấm công theo phòng ban thành công.");
        } else {
            return ResponseUtil.badRequest("Cần truyền employeeId hoặc departmentId");
        }
    }

    @GetMapping("/working-employees")
    public List<CurrentWorkingEmployeeDTO> getCurrentlyWorkingEmployees(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return attendanceService.getCurrentlyWorkingEmployees(date);
    }

    @GetMapping("/raw-logs")
    public ResponseEntity<ApiResponse<Page<AttendanceLogDTO>>> getRawAttendanceLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            return ResponseUtil.badRequest("Ngày kết thúc phải >= ngày bắt đầu");
        }

        Page<AttendanceLogDTO> logs = attendanceService.getRawAttendanceLogs(employeeId, startDate, endDate, page,
                size);
        return ResponseUtil.success(logs, "Lấy raw attendance logs thành công");
    }
}