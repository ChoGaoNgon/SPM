package htmp.codien.quanlycodien.modules.asset.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.asset.entity.AssetAssignment;

import java.util.List;

@Repository
public interface AssetAssignmentRepository extends JpaRepository<AssetAssignment, Long> {

        List<AssetAssignment> findByAssetId(Long assetId);

        List<AssetAssignment> findByEmployeeUseId(Long employeeId);

        boolean existsByAssetIdAndReturnAtIsNull(Long assetId);

}