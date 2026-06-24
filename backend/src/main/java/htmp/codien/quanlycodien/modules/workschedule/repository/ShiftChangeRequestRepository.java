package htmp.codien.quanlycodien.modules.workschedule.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.workschedule.entity.ShiftChangeRequest;
import htmp.codien.quanlycodien.modules.workschedule.enums.WorkRequestStatus;

@Repository
public interface ShiftChangeRequestRepository extends JpaRepository<ShiftChangeRequest, Long> {

        List<ShiftChangeRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

        List<ShiftChangeRequest> findByStatus(WorkRequestStatus pendingManager);

        List<ShiftChangeRequest> findByStatusAndEmployee_Department_Id(WorkRequestStatus pendingManager,
                        Long departmentId);

        List<ShiftChangeRequest> findByStatusAndEmployee_Department_ParentDepartment_Id(WorkRequestStatus pendingHead,
                        Long departmentId);

        List<ShiftChangeRequest> findByStatusInAndWorkDateBetween(List<WorkRequestStatus> of, LocalDate startDate,
                        LocalDate endDate);

        List<ShiftChangeRequest> findByCreatedByOrderByCreatedAtDesc(String code);

        List<ShiftChangeRequest> findAllByOrderByCreatedAtDesc();

}