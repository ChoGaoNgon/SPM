package htmp.codien.quanlycodien.modules.machine.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.machine.entity.Machine;

public interface MachineRepository extends JpaRepository<Machine, Long> {

  Optional<Machine> findByCode(String code);

  Optional<Machine> findFirstBySpecificationId(Long specificationId);

  List<Machine> findAllByMachineNo(Long machineNo);

  Boolean existsByCode(String code);

  Boolean existsByMachineNo(Long machineNo);

  Boolean existsByMachineNoAndIdNot(Long machineNo, Long id);

  Long countBySpecificationId(Long specificationId);

  @Query("""
      SELECT m
      FROM Machine m
      WHERE (:machineTypeId IS NULL OR m.machineType.id = :machineTypeId)
        AND (
          :keyword IS NULL
          OR :keyword = ''
          OR LOWER(m.code) LIKE LOWER(CONCAT('%', :keyword, '%'))
          OR LOWER(m.position) LIKE LOWER(CONCAT('%', :keyword, '%'))
          OR STR(m.machineNo) LIKE CONCAT('%', :keyword, '%')
        )
      """)
  Page<Machine> findByKeyword(@Param("keyword") String keyword,
      @Param("machineTypeId") Long machineTypeId,
      Pageable pageable);

  @Query("SELECT DISTINCT m.name FROM MachineDetail m WHERE m.name IS NOT NULL")
  List<String> findDistinctDetailNames();

  @Query("SELECT DISTINCT m.model FROM MachineDetail m WHERE m.model IS NOT NULL")
  List<String> findDistinctModels();

  @Query("SELECT DISTINCT m.voltage FROM MachineDetail m WHERE m.voltage IS NOT NULL")
  List<String> findDistinctVoltages();

  @Query("SELECT DISTINCT m.maker FROM MachineDetail m WHERE m.maker IS NOT NULL")
  List<String> findDistinctMakers();

  @Query("SELECT DISTINCT m.position FROM Machine m WHERE m.position IS NOT NULL")
  List<String> findDistinctPositions();

  @Query("""
      SELECT m
      FROM Machine m
      LEFT JOIN m.specification s
      WHERE (:machineTypeId IS NULL OR m.machineType.id = :machineTypeId)
        AND (
          :keyword IS NULL
          OR :keyword = ''
          OR LOWER(m.code) LIKE LOWER(CONCAT('%', :keyword, '%'))
          OR LOWER(m.position) LIKE LOWER(CONCAT('%', :keyword, '%'))
          OR STR(m.machineNo) LIKE CONCAT('%', :keyword, '%')
          OR LOWER(COALESCE(s.maker, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
          OR LOWER(COALESCE(s.modelName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
          OR LOWER(COALESCE(s.machineType, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
          OR LOWER(COALESCE(s.manufacturedDate, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
        )
      """)
  Page<Machine> findAllForSpecificationManagement(@Param("keyword") String keyword,
      @Param("machineTypeId") Long machineTypeId,
      Pageable pageable);

}
