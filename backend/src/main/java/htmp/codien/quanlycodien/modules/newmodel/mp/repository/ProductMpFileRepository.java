package htmp.codien.quanlycodien.modules.newmodel.mp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.newmodel.mp.entity.ProductMpFile;

@Repository
public interface ProductMpFileRepository extends JpaRepository<ProductMpFile, Long> {
    List<ProductMpFile> findByProductMpCheckItemId(Long id);

    @Modifying
    @Query("DELETE FROM ProductMpFile f WHERE f.productMpCheckItem.id = :checkItemId AND f.filePath IN :filePaths")
    void deleteByCheckItemIdAndFilePaths(@Param("checkItemId") Long checkItemId,
            @Param("filePaths") List<String> filePaths);
}
