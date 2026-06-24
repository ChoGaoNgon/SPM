package htmp.codien.quanlycodien.modules.newmodel.mp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import htmp.codien.quanlycodien.modules.newmodel.mp.entity.ProductMpCheckItemTemplate;

public interface ProductMpCheckItemTemplateRepository extends JpaRepository<ProductMpCheckItemTemplate, Long> {

    List<ProductMpCheckItemTemplate> findByIsActiveTrue();

}
