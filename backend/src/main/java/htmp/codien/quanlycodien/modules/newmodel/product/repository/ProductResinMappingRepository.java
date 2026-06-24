package htmp.codien.quanlycodien.modules.newmodel.product.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.newmodel.mapping.entity.ProductResinMapping;

@Repository
public interface ProductResinMappingRepository
        extends JpaRepository<ProductResinMapping, Long>, JpaSpecificationExecutor<ProductResinMapping> {

    List<ProductResinMapping> findByProductId(Long productId);

    boolean existsByProductIdAndResinCode(Long productId, String resinCode);

    Optional<ProductResinMapping> findByProductIdAndResinCode(Long productId, String resinCode);

    void deleteByProductId(Long productId);
}
