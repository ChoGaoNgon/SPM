package htmp.codien.quanlycodien.modules.newmodel.mapping.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.newmodel.mapping.entity.ProductCodeMapping;

@Repository
public interface ProductCodeMappingRepository extends JpaRepository<ProductCodeMapping, Long> {
    List<ProductCodeMapping> findAllByMesProductCodeIn(
            Collection<String> mesCodes);
}