package htmp.codien.quanlycodien.modules.workschedule.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.DailyScheduleDTO;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.DailyWorkScheduleStatsDTO;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.EmployeeScheduleRequest;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.EmployeeScheduleResponse;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.MyScheduleResponse;
import htmp.codien.quanlycodien.modules.workschedule.service.ExternalScheduleAPIService;
import htmp.codien.quanlycodien.modules.workschedule.service.WorkScheduleService;
import lombok.RequiredArgsConstructor;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.List;

import org.springframework.core.io.InputStreamResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/work-schedules")
@RequiredArgsConstructor
public class WorkScheduleController {
        private final WorkScheduleService workScheduleService;
        private final ExternalScheduleAPIService externalScheduleAPIService;

        @GetMapping("/department/{departmentId}")
        public ResponseEntity<ApiResponse<List<EmployeeScheduleResponse>>> getWorkScheduleByDepartment(
                        @PathVariable Long departmentId,
                        @RequestParam(required = false) String month,
                        @RequestParam(required = false) String year) {
                List<EmployeeScheduleResponse> schedules = workScheduleService.getWorkScheduleByDepartment(departmentId,
                                month, year, false);
                return ResponseUtil.success(schedules, "Lấy lịch làm việc thành công");
        }

        @GetMapping("/employee/{employeeId}")
        public ResponseEntity<ApiResponse<MyScheduleResponse>> getWorkScheduleByEmployee(
                        @PathVariable Long employeeId,
                        @RequestParam(required = false) String month,
                        @RequestParam(required = false) String year) {
                MyScheduleResponse schedule = workScheduleService.getWorkScheduleByEmployee(employeeId, month,
                                year);
                return ResponseUtil.success(schedule, "Lấy lịch làm việc thành công");
        }

        @GetMapping("/employee/{employeeId}/day")
        public ResponseEntity<ApiResponse<DailyScheduleDTO>> getDailySchedule(
                        @PathVariable Long employeeId,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

                DailyScheduleDTO dto = workScheduleService.getDailySchedule(employeeId, date);

                return ResponseUtil.success(dto, "Lấy lịch làm việc trong ngày thành công");
        }

        @PatchMapping
        public ResponseEntity<ApiResponse<Void>> updateSchedulesOnce(
                        @RequestParam Long employeeId,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                        @RequestParam Long newShiftId) {
                workScheduleService.updateEmployeeShift(employeeId, date, newShiftId);
                return ResponseUtil.success(null, "Cập nhật lịch làm việc thành công");
        }

        @PostMapping
        public ResponseEntity<ApiResponse<Void>> saveSchedulesOnce(@RequestBody List<EmployeeScheduleRequest> request) {
                workScheduleService.saveSchedulesOnce(request);
                return ResponseUtil.success(null, "Xếp lịch làm việc thành công");
        }

        @GetMapping("/export")
        public ResponseEntity<InputStreamResource> exportWorkSchedule(
                        @RequestParam Long departmentId,
                        @RequestParam int year,
                        @RequestParam int month) {

                ByteArrayInputStream in = workScheduleService.exportWorkSchedule(departmentId, year, month);

                String filename = String.format("schedule-dept-%d-%d-%d.xlsx", departmentId, year, month);

                HttpHeaders headers = new HttpHeaders();
                headers.add("Content-Disposition", "attachment; filename=" + filename);

                return ResponseEntity.ok()
                                .headers(headers)
                                .contentType(
                                                MediaType.parseMediaType(
                                                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                                .body(new InputStreamResource(in));
        }

        @GetMapping("/stats/daily")
        public ResponseEntity<ApiResponse<DailyWorkScheduleStatsDTO>> getDailyStats(
                        @RequestParam Long departmentId,
                        @RequestParam LocalDate date) {
                DailyWorkScheduleStatsDTO stats = workScheduleService.getDailyWorkScheduleStats(departmentId, date);
                return ResponseUtil.success(stats, "Lấy thống kê lịch làm việc thành công");
        }

        @PostMapping("/import")
        public ResponseEntity<ApiResponse<Void>> importWorkSchedule(
                        @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
                        @RequestParam int month,
                        @RequestParam int year) {
                workScheduleService.importWorkSchedule(file, month, year);
                return ResponseUtil.success(null, "Nhập lịch làm việc thành công");
        }

        @PostMapping("/sync")
        public ResponseEntity<ApiResponse<Void>> syncWorkSchedule(
                        @RequestParam int year,
                        @RequestParam int month,
                        @RequestParam(defaultValue = "true") boolean useCodeHcns) {

                externalScheduleAPIService.fetchAndSyncSchedule(month, year, useCodeHcns);
                return ResponseUtil.success(null,
                                String.format("Đồng bộ lịch làm việc tháng %d/%d thành công", month, year));
        }
}