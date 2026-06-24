package htmp.codien.quanlycodien.modules.workschedule.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.workschedule.entity.ShiftPattern;

@Repository
public interface ShiftPatternRepository extends JpaRepository<ShiftPattern, Long> {

    List<ShiftPattern> findByIsActiveTrueOrderByDisplayOrderAsc();

    Optional<ShiftPattern> findByCode(String code);
}
