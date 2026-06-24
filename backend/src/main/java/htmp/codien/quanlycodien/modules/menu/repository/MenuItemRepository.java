package htmp.codien.quanlycodien.modules.menu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.menu.entity.MenuItem;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByIsActiveAndIsVisibleOrderByDisplayOrder(Boolean isActive, Boolean isVisible);

    List<MenuItem> findByParentIdIsNullAndIsActiveAndIsVisibleOrderByDisplayOrder(Boolean isActive, Boolean isVisible);

    List<MenuItem> findByParentIdAndIsActiveAndIsVisibleOrderByDisplayOrder(Long parentId, Boolean isActive,
            Boolean isVisible);

    @Query("SELECT m FROM MenuItem m WHERE m.isActive = true AND m.isVisible = true ORDER BY m.displayOrder")
    List<MenuItem> findAllActiveAndVisible();
}
