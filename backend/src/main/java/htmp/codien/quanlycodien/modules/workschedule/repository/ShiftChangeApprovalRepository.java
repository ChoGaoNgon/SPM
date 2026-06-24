package htmp.codien.quanlycodien.modules.workschedule.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.workschedule.entity.ShiftChangeApproval;

@Repository
public interface ShiftChangeApprovalRepository extends JpaRepository<ShiftChangeApproval, Long> {
    List<ShiftChangeApproval> findByApprover_IdAndRequest_WorkDateBetween(Long approverId, LocalDate from,
            LocalDate to);
}