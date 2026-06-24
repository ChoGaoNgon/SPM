package htmp.codien.quanlycodien.modules.asset.service;

import htmp.codien.quanlycodien.modules.asset.dto.borrow.AssetBorrowCreationRequest;
import htmp.codien.quanlycodien.modules.asset.dto.borrow.AssetBorrowRejectRequest;
import htmp.codien.quanlycodien.modules.asset.dto.borrow.AssetBorrowResponse;
import htmp.codien.quanlycodien.modules.asset.dto.borrow.AssetBorrowUpdationRequest;
import htmp.codien.quanlycodien.modules.asset.entity.AssetBorrow;
import htmp.codien.quanlycodien.modules.asset.enums.AssetBorrowStatus;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AssetBorrowService {
    void createAssetBorrow(Long assetId, AssetBorrowCreationRequest request);

    void updateAssetBorrow(Long id, AssetBorrowUpdationRequest request);

    Page<AssetBorrowResponse> getAllAssetBorrows(Pageable pageable,
            String keyword,
            Long requestedById,
            LocalDate date,
            LocalDate borrowDate,
            AssetBorrowStatus status);

    AssetBorrowResponse getAssetBorrowById(Long id);

    void deleteAssetBorrow(Long id);

    List<AssetBorrowResponse> getAssetBorrowsByRequestedById(Long requestedById);

    List<AssetBorrowResponse> getAssetBorrowsByAssetId(Long assetId);

    void updateStatusAssetBorrow(Long id, AssetBorrowStatus status);

    void returnAsset(Long id);

    AssetBorrow findEntityById(Long id);

    void approveAssetBorrow(Long id);

    void rejectAssetBorrow(Long id, AssetBorrowRejectRequest req);
}