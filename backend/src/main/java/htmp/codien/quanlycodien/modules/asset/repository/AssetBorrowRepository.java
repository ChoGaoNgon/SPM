package htmp.codien.quanlycodien.modules.asset.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.asset.entity.AssetBorrow;
import htmp.codien.quanlycodien.modules.asset.enums.AssetBorrowStatus;

import java.util.List;

@Repository
public interface AssetBorrowRepository extends JpaRepository<AssetBorrow, Long>, JpaSpecificationExecutor<AssetBorrow> {

    List<AssetBorrow> findByRequestedById(Long requestedById);

    List<AssetBorrow> findByAssetId(Long assetId);

    List<AssetBorrow> findByStatus(AssetBorrowStatus status);

    List<AssetBorrow> findByRequestedByIdAndStatus(Long requestedById, AssetBorrowStatus status);

    List<AssetBorrow> findByAssetIdAndStatus(Long assetId, AssetBorrowStatus status);
}
