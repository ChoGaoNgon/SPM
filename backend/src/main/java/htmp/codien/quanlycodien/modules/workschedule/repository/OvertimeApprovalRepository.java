package htmp.codien.quanlycodien.modules.workschedule.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.workschedule.entity.OvertimeApproval;

@Repository
public interface OvertimeApprovalRepository extends JpaRepository<OvertimeApproval, Long> {

    List<OvertimeApproval> findByApprover_IdAndRequest_WorkDateBetween(Long approverId, LocalDate startDate,
            LocalDate endDate);
}