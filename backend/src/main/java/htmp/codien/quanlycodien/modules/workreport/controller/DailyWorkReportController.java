package htmp.codien.quanlycodien.modules.workreport.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.workreport.dto.DailyWorkReportDTO;
import htmp.codien.quanlycodien.modules.workreport.dto.EmployeeWorkReportDTO;
import htmp.codien.quanlycodien.modules.workreport.service.DailyWorkReportService;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/daily-reports")
@AllArgsConstructor
public class DailyWorkReportController {

    private final DailyWorkReportService reportService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<?>>> getReports(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        if (employeeId == null && date == null) {

            List<DailyWorkReportDTO> reports = reportService.getAllReports();
            return ResponseUtil.success(reports, "Lấy danh sách báo cáo thành công");
        } else if (employeeId == null) {

            List<EmployeeWorkReportDTO> reports = reportService.getReportsByDate(date);
            return ResponseUtil.success(reports, "Lấy danh sách báo cáo theo ngày thành công");
        } else {

            List<EmployeeWorkReportDTO> reports = reportService.getReportsByEmployeeIdAndDate(employeeId, date);
            return ResponseUtil.success(reports, "Lấy danh sách báo cáo theo nhân viên và ngày thành công");
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> createReport(
            @RequestPart(name = "file", required = false) MultipartFile file,
            @RequestParam(name = "employeeId") Long employeeId,
            @RequestParam(name = "startDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDateTime,
            @RequestParam(name = "endDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDateTime,
            @RequestParam(name = "taskDescription") String taskDescription) {
        try {
            reportService.createReport(employeeId, startDateTime, endDateTime, taskDescription, file);
            return ResponseUtil.success(null, "Tạo báo cáo thành công");
        } catch (Exception e) {
            return ResponseUtil.badRequest("Lỗi khi tạo báo cáo: " + e.getMessage());
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> updateReport(
            @PathVariable Long id,
            @RequestParam(name = "startDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDateTime,
            @RequestParam(name = "endDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDateTime,
            @RequestParam(name = "taskDescription") String taskDescription,
            @RequestPart(name = "file", required = false) MultipartFile file) {
        try {
            reportService.updateReport(id, startDateTime, endDateTime, taskDescription, file);
            return ResponseUtil.success(null, "Cập nhật báo cáo thành công");
        } catch (Exception e) {
            return ResponseUtil.badRequest("Cập nhật thất bại: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReport(@PathVariable Long id) {
        try {
            reportService.deleteReport(id);
            return ResponseUtil.success(null, "Xóa báo cáo thành công");
        } catch (Exception e) {
            return ResponseUtil.badRequest("Xóa thất bại: " + e.getMessage());
        }
    }
}
