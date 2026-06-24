package htmp.codien.quanlycodien.modules.machine.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.machine.entity.MachineType;

@Repository
public interface MachineTypeRepository extends JpaRepository<MachineType, Long> {
    Boolean existsByCode(String code);

    Boolean existsByName(String name);

    Optional<MachineType> findByCode(String code);

    Optional<MachineType> findByName(String name);
}
