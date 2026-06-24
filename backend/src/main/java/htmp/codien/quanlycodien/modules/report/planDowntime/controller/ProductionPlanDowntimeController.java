package htmp.codien.quanlycodien.modules.report.planDowntime.controller;

import java.io.OutputStream;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.modules.report.planDowntime.service.ProductionPlanDowntimeService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/report/plan-downtime")
@RequiredArgsConstructor
public class ProductionPlanDowntimeController {

        private final ProductionPlanDowntimeService productionPlanDowntimeService;

        @PostMapping(value = "/export", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public void export(
                        @RequestParam("file") MultipartFile file,
                        HttpServletResponse response) throws Exception {

                response.setContentType(
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

                response.setHeader(
                                "Content-Disposition",
                                "attachment; filename=plan-downtime.xlsx");

                try (OutputStream os = response.getOutputStream()) {
                        productionPlanDowntimeService
                                        .exportMachineDowntimeReportToExcel(file, os);

                        os.flush();
                }
        }
}