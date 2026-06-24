package htmp.codien.quanlycodien.modules.workschedule.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.workschedule.entity.Shift;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {

    Optional<Shift> findByShiftCode(String newShiftCode);

    Optional<Shift> findByCodeHcns(String codeHcns);

}