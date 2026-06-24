package htmp.codien.quanlycodien.modules.asset.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.asset.entity.AssetSpecification;

import java.util.Optional;

@Repository
public interface AssetSpecificationRepository extends JpaRepository<AssetSpecification, Long> {

    @Query("SELECT a FROM AssetSpecification a JOIN FETCH a.asset WHERE a.asset.id = :assetId")
    Optional<AssetSpecification> findByAssetId(@Param("assetId") Long assetId);

    boolean existsByAssetId(Long assetId);

    void deleteByAssetId(Long assetId);

}
