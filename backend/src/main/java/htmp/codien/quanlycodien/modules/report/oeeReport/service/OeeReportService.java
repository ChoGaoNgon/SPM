package htmp.codien.quanlycodien.modules.report.oeeReport.service;

import java.io.OutputStream;
import java.time.LocalDate;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.modules.report.oeeReport.dto.MachineOperationReportDTO;
import htmp.codien.quanlycodien.modules.report.oeeReport.dto.MoldChangeReportDTO;
import htmp.codien.quanlycodien.modules.report.oeeReport.dto.NgReportDTO;
import htmp.codien.quanlycodien.modules.report.oeeReport.dto.OeeReportFilterRequest;
import htmp.codien.quanlycodien.modules.report.oeeReport.dto.ProductionIssueReportDTO;
import htmp.codien.quanlycodien.modules.report.oeeReport.dto.SetupReportDTO;

public interface OeeReportService {
        List<MachineOperationReportDTO> getMESBCKQVHPLV(OeeReportFilterRequest request);

        List<NgReportDTO> getMESBKDangKyNG(OeeReportFilterRequest request);

        List<MoldChangeReportDTO> getMESBKThayKhuon(OeeReportFilterRequest request);

        List<SetupReportDTO> getMESBKSetup(OeeReportFilterRequest request);

        List<ProductionIssueReportDTO> getMESBKPhatSinh(OeeReportFilterRequest request);

        List<?> debugOEE(LocalDate date);

        void exportDebugReportToExcel(
                        LocalDate date,
                        OutputStream os) throws Exception;

        void exportMachineOperationReportToExcel(
                        MultipartFile file,
                        LocalDate date,
                        OutputStream os) throws Exception;
}
