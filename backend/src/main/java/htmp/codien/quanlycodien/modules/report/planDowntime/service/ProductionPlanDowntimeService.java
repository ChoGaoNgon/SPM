package htmp.codien.quanlycodien.modules.report.planDowntime.service;

import java.io.OutputStream;

import org.springframework.web.multipart.MultipartFile;

public interface ProductionPlanDowntimeService {

    void exportMachineDowntimeReportToExcel(MultipartFile file, OutputStream os) throws Exception;
}
