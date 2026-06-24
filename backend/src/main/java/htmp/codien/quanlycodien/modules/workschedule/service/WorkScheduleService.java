package htmp.codien.quanlycodien.modules.workschedule.service;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.DailyScheduleDTO;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.DailyWorkScheduleStatsDTO;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.EmployeeScheduleRequest;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.EmployeeScheduleResponse;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.ExternalWorkScheduleDTO;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.MyScheduleResponse;

public interface WorkScheduleService {
        void saveSchedulesOnce(List<EmployeeScheduleRequest> requests);

        List<EmployeeScheduleResponse> getWorkScheduleByDepartment(Long departmentId, String month, String year,
                        boolean isCodeHcns);

        MyScheduleResponse getWorkScheduleByEmployee(Long employeeId, String month, String year);

        ByteArrayInputStream exportWorkSchedule(Long departmentId, int year, int month);

        void updateEmployeeShift(Long employeeId, LocalDate date, Long newShiftId);

        DailyScheduleDTO getDailySchedule(Long employeeId, LocalDate date);

        DailyWorkScheduleStatsDTO getDailyWorkScheduleStats(Long departmentId, LocalDate date);

        void importWorkSchedule(MultipartFile file, int month, int year);

        void syncWorkScheduleFromExternalAPI(ExternalWorkScheduleDTO externalData, int year, int month,
                        boolean useCodeHcns);
}