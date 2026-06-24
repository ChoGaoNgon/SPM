package htmp.codien.quanlycodien.modules.report.oeeReport.controller;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.modules.report.oeeReport.service.OeeReportService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/db3/oee-report")
@RequiredArgsConstructor
public class OeeReportController {

        private static final LocalTime ALLOW_TIME = LocalTime.of(8, 30);

        private final OeeReportService oeeReportService;

        private void validateAccessTime() {

                LocalTime now = LocalTime.now();

                if (now.isBefore(ALLOW_TIME)) {
                        throw new RuntimeException("Chỉ được truy cập sau 08:30 sáng");
                }
        }

        @GetMapping("/debug-export")
        public void debugExportExcel(
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                        HttpServletResponse response) throws Exception {

                validateAccessTime();

                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

                oeeReportService.exportDebugReportToExcel(date, outputStream);

                response.setContentType(
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

                response.setHeader(
                                "Content-Disposition",
                                "attachment; filename=oee-debug-" + date + ".xlsx");

                response.getOutputStream().write(outputStream.toByteArray());
        }

        @PostMapping(value = "/export", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public void export(
                        @RequestParam("file") MultipartFile file,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                        HttpServletResponse response) throws Exception {

                validateAccessTime();

                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

                oeeReportService.exportMachineOperationReportToExcel(
                                file,
                                date,
                                outputStream);

                response.setContentType(
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

                response.setHeader(
                                "Content-Disposition",
                                "attachment; filename=oee-report.xlsx");

                response.getOutputStream().write(outputStream.toByteArray());
        }
}