package htmp.codien.quanlycodien.modules.newmodel.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductMachine;

public interface ProductMachineRepository extends JpaRepository<ProductMachine, Long> {
    @Modifying
    @Query("DELETE FROM ProductMachine pm WHERE pm.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}
