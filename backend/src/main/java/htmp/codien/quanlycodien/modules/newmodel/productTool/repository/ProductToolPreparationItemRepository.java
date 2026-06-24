package htmp.codien.quanlycodien.modules.newmodel.productTool.repository;

import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ToolPreparationType;
import htmp.codien.quanlycodien.modules.newmodel.productTool.entity.ProductToolPreparationItem;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductToolPreparationItemRepository extends JpaRepository<ProductToolPreparationItem, Long> {

        @Query("SELECT item FROM ProductToolPreparationItem item " +
                        "LEFT JOIN FETCH item.product " +
                        "LEFT JOIN FETCH item.responsibleEmployee " +
                        "WHERE item.product.id = :productId AND item.deletedAt IS NULL " +
                        "ORDER BY item.processType, item.id")
        List<ProductToolPreparationItem> findActiveByProductId(@Param("productId") Long productId);

        @Query("SELECT item FROM ProductToolPreparationItem item " +
                        "LEFT JOIN FETCH item.product " +
                        "LEFT JOIN FETCH item.responsibleEmployee " +
                        "WHERE item.product.id = :productId AND item.processType = :processType AND item.deletedAt IS NULL "
                        +
                        "ORDER BY item.id")
        List<ProductToolPreparationItem> findActiveByProductIdAndProcessType(
                        @Param("productId") Long productId,
                        @Param("processType") ToolPreparationType processType);

        @Query("SELECT item FROM ProductToolPreparationItem item " +
                        "LEFT JOIN FETCH item.product " +
                        "LEFT JOIN FETCH item.responsibleEmployee " +
                        "WHERE item.responsibleEmployee.id = :employeeId AND item.deletedAt IS NULL " +
                        "ORDER BY item.product.id, item.processType, item.id")
        List<ProductToolPreparationItem> findActiveByResponsibleEmployeeId(@Param("employeeId") Long employeeId);

        @Query("SELECT item FROM ProductToolPreparationItem item " +
                        "LEFT JOIN FETCH item.product " +
                        "LEFT JOIN FETCH item.responsibleEmployee " +
                        "WHERE item.id = :id AND item.deletedAt IS NULL")
        Optional<ProductToolPreparationItem> findActiveById(@Param("id") Long id);

        @Query("SELECT COUNT(item) FROM ProductToolPreparationItem item " +
                        "WHERE item.product.id = :productId AND item.deletedAt IS NULL")
        long countActiveByProductId(@Param("productId") Long productId);

        @Query("SELECT COUNT(item) FROM ProductToolPreparationItem item " +
                        "WHERE item.product.id = :productId AND item.deletedAt IS NULL AND item.status <> 'COMPLETED'")
        long countIncompleteByProductId(@Param("productId") Long productId);
}
