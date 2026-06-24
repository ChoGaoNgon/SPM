package htmp.codien.quanlycodien.modules.workreport.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.modules.workreport.dto.DailyWorkReportDTO;
import htmp.codien.quanlycodien.modules.workreport.dto.EmployeeWorkReportDTO;

public interface DailyWorkReportService {
        List<DailyWorkReportDTO> getAllReports();

        List<EmployeeWorkReportDTO> getReportsByDate(LocalDate date);

        List<EmployeeWorkReportDTO> getReportsByEmployeeIdAndDate(Long employeeId, LocalDate date);

        void createReport(Long employeeId, LocalDateTime startDateTime, LocalDateTime endDateTime,
                        String taskDescription, MultipartFile file);

        void updateReport(Long id, LocalDateTime startDateTime, LocalDateTime endDateTime,
                        String taskDescription, MultipartFile file);

        void deleteReport(Long id);
}
