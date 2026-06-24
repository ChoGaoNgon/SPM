package htmp.codien.quanlycodien.modules.newmodel.product.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductHistorySummaryResponse;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductHistory;

@Repository
public interface ProductHistoryRepository extends JpaRepository<ProductHistory, Long> {

        List<ProductHistory> findByProduct_IdAndFieldNameOrderByCreatedAtDesc(
                        @Param("productId") Long productId,
                        @Param("fieldName") String fieldName);

        List<ProductHistory> findByProduct_IdOrderByCreatedAtDesc(Long productId);

        @Query("SELECT new htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductHistorySummaryResponse(" +
                        "h.fieldName, CAST(COUNT(h.id) AS int)) " +
                        "FROM ProductHistory h " +
                        "WHERE h.product.id = :productId " +
                        "GROUP BY h.fieldName " +
                        "ORDER BY h.fieldName")
        List<ProductHistorySummaryResponse> countChangesByField(@Param("productId") Long productId);

        @Modifying
        void deleteByProduct_Id(Long productId);
}