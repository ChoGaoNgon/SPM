package htmp.codien.quanlycodien.modules.newmodel.productModel.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.newmodel.productModel.dto.ModelResponse;
import htmp.codien.quanlycodien.modules.newmodel.productModel.entity.Model;

@Repository
public interface ModelRepository extends JpaRepository<Model, Long>, JpaSpecificationExecutor<Model> {
    @Query(value = """
                SELECT
                    DISTINCT
                    m.id AS id,
                    m.code AS code,
                    c.id AS customerId,
                    c.name AS customerName,
                    m.ordered_date AS orderedDate
                FROM models m
                JOIN products p ON m.id = p.model_id
                JOIN customers AS c ON m.customer_id = c.id
                JOIN molds on molds.id = p.mold_id
                WHERE molds.code LIKE CONCAT('%', :keyword, '%')
                   OR p.code LIKE CONCAT('%', :keyword, '%')
                   OR m.code LIKE CONCAT('%', :keyword, '%')
                   OR c.name LIKE CONCAT('%', :keyword, '%')
            """, countQuery = """
                SELECT COUNT(DISTINCT m.id)
                FROM models m
                JOIN products p ON m.id = p.model_id
                JOIN customers AS c ON m.customer_id = c.id
                JOIN molds on molds.id = p.mold_id
                WHERE molds.code LIKE CONCAT('%', :keyword, '%')
                   OR p.code LIKE CONCAT('%', :keyword, '%')
                   OR m.code LIKE CONCAT('%', :keyword, '%')
                   OR c.name LIKE CONCAT('%', :keyword, '%')
            """, nativeQuery = true)
    Page<ModelResponse> findByProductCodeOrMoldCode(@Param("keyword") String keyword, Pageable pageable);

    long countByCustomerId(Long customerId);

    Optional<Model> findByCode(String code);

    Boolean existsByCode(String code);
}
