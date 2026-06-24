package htmp.codien.quanlycodien.modules.newmodel.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductPacking;

public interface ProductPackingRepository extends JpaRepository<ProductPacking, Long> {
    @Modifying
    @Query("DELETE FROM ProductPacking pp WHERE pp.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}
