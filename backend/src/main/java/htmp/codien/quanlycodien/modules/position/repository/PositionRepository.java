package htmp.codien.quanlycodien.modules.position.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.position.entity.Position;

@Repository
public interface PositionRepository extends JpaRepository<Position, Long> {

    boolean existsByCode(String code);

    boolean existsByName(String name);

}
