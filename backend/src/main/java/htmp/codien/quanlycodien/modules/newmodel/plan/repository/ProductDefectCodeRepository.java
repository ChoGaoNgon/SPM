package htmp.codien.quanlycodien.modules.newmodel.plan.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductDefectCodeRepository extends JpaRepository<ProductDefectCode, Long> {
    Optional<ProductDefectCode> findByCode(String code);
}
