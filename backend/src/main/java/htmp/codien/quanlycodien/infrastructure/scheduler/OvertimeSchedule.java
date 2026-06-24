package htmp.codien.quanlycodien.infrastructure.scheduler;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.modules.attendance.entity.Attendance;
import htmp.codien.quanlycodien.modules.attendance.repository.AttendanceRepository;
import htmp.codien.quanlycodien.modules.workschedule.entity.OvertimeRequest;
import htmp.codien.quanlycodien.modules.workschedule.entity.WorkSchedule;
import htmp.codien.quanlycodien.modules.workschedule.enums.WorkRequestStatus;
import htmp.codien.quanlycodien.modules.workschedule.helper.OvertimeHelper;
import htmp.codien.quanlycodien.modules.workschedule.repository.OvertimeRequestRepository;
import htmp.codien.quanlycodien.modules.workschedule.repository.WorkScheduleRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OvertimeSchedule {

    private final OvertimeHelper overtimeHelper;
    private final OvertimeRequestRepository overtimeRequestRepository;
    private final AttendanceRepository attendanceRepository;
    private final WorkScheduleRepository workScheduleRepository;

    @Scheduled(cron = "0 01 02,08,15,18,23 * * ?", zone = "Asia/Ho_Chi_Minh")
    @Transactional
    public void processDailyOvertime() {
        LocalDateTime now = LocalDateTime.now();
        LocalDate from = now.toLocalDate().minusDays(13); 
        LocalDate to = now.toLocalDate();
        
        List<OvertimeRequest> requests = overtimeRequestRepository.findRequestsNeedActualUpdate(
                from, to);

        Integer processedCount = 0;

        for (OvertimeRequest request : requests) {

            
            Attendance attendance = attendanceRepository
                    .findByEmployeeIdAndWorkDate(request.getEmployee().getId(), request.getWorkDate())
                    .orElse(null);
            processedCount++;

            if (attendance == null || attendance.getCheckinTime() == null || attendance.getCheckoutTime() == null) {
                continue;
            }

            
            request = overtimeHelper.updateOvertimeRequest(request, attendance.getCheckinTime(),
                    attendance.getCheckoutTime());

            
            if (List.of(
                    WorkRequestStatus.APPROVED,
                    WorkRequestStatus.ASSIGN_DIRECT,
                    WorkRequestStatus.APPROVED_BY_EMPLOYEE).contains(request.getStatus())) {

                WorkSchedule workSchedule = overtimeHelper.updateShiftFromActualOvertime(request);
                workScheduleRepository.save(workSchedule);
            }

            
            overtimeRequestRepository.save(request);
        }
    }
}
