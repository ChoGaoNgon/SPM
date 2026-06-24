package htmp.codien.quanlycodien.modules.asset.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.asset.entity.Asset;
import htmp.codien.quanlycodien.modules.asset.enums.AssetAssignmentStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long>, JpaSpecificationExecutor<Asset> {

    boolean existsByCode(String code);

    List<Asset> findAllByStatus(AssetAssignmentStatus status);

    Optional<Asset> findByCode(String code);

    List<Asset> findByDepartmentId(Long departmentId);

    List<Asset> findByAssetTypeId(Long assetTypeId);

    @Query("SELECT a FROM Asset a LEFT JOIN FETCH a.assetSpecification WHERE a.id = :id")
    Optional<Asset> findByIdWithSpecification(@Param("id") Long id);

    @EntityGraph(attributePaths = { "department", "assetType" })
    Page<Asset> findAll(Pageable pageable);

}
