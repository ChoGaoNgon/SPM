package htmp.codien.quanlycodien.modules.newmodel.mp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import htmp.codien.quanlycodien.modules.newmodel.mp.entity.ProductMpCheckList;

public interface ProductMpCheckListRepository extends JpaRepository<ProductMpCheckList, Long> {

    Optional<ProductMpCheckList> findByProductId(Long productId);

    @Modifying
    @Query("DELETE FROM ProductMpFile f WHERE f.productMpCheckItem.id IN (SELECT ci.id FROM ProductMpCheckItem ci WHERE ci.productMpCheckList.id = :checkListId)")
    void deleteFilesByCheckListId(@Param("checkListId") Long checkListId);

    @Modifying
    @Query("DELETE FROM ProductMpCheckItem ci WHERE ci.productMpCheckList.id = :checkListId")
    void deleteCheckItemsByCheckListId(@Param("checkListId") Long checkListId);

    @Modifying
    @Query("DELETE FROM ProductMpApproval a WHERE a.productMpCheckList.id = :checkListId")
    void deleteApprovalsByCheckListId(@Param("checkListId") Long checkListId);

    @Modifying
    @Query("DELETE FROM ProductMpCheckList c WHERE c.id = :checkListId")
    void deleteCheckListById(@Param("checkListId") Long checkListId);

    @Query("SELECT c.id FROM ProductMpCheckList c WHERE c.product.id = :productId")
    Optional<Long> findCheckListIdByProductId(@Param("productId") Long productId);

    boolean existsByProductId(Long productId);

}
