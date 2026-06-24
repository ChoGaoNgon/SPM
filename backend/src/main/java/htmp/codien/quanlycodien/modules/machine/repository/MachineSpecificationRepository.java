package htmp.codien.quanlycodien.modules.machine.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.machine.entity.MachineSpecification;

public interface MachineSpecificationRepository extends JpaRepository<MachineSpecification, Long> {

    @Query("""
            SELECT s
            FROM MachineSpecification s
            WHERE (
                :keyword IS NULL
                OR :keyword = ''
                OR LOWER(COALESCE(s.maker, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(s.modelName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(s.machineType, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(s.manufacturedDate, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(s.clampingSystemType, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(s.robotMaker, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(s.robotModelName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
            """)
    Page<MachineSpecification> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT m.specification FROM Machine m WHERE m.id = :machineId")
    Optional<MachineSpecification> findByMachineId(@Param("machineId") Long machineId);
}
