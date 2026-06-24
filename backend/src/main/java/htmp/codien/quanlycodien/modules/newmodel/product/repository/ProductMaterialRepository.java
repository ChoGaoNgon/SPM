package htmp.codien.quanlycodien.modules.newmodel.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductMaterial;

public interface ProductMaterialRepository extends JpaRepository<ProductMaterial, Long> {
    @Modifying
    @Query("DELETE FROM ProductMaterial pm WHERE pm.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}
