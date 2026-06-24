package htmp.codien.quanlycodien.modules.asset.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.asset.dto.type.AssetTypeResponse;
import htmp.codien.quanlycodien.modules.asset.entity.AssetType;

@Repository
public interface AssetTypeRepository extends JpaRepository<AssetType, Long> {
    @Query("""
                SELECT new htmp.codien.quanlycodien.modules.asset.dto.type.AssetTypeResponse(
                    at.id,
                    at.name,
                    at.description,
                    COUNT(a.id)
                )
                FROM AssetType at
                LEFT JOIN Asset a ON a.assetType.id = at.id
                GROUP BY at.id, at.name, at.description
            """)
    List<AssetTypeResponse> getAssetTypeQuantities();

    boolean existsByName(String name);

    Optional<AssetType> findByName(String name);
}
