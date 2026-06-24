package htmp.codien.quanlycodien.modules.newmodel.productEvent.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import htmp.codien.quanlycodien.modules.newmodel.productEvent.entity.ProductEventDelivery;

public interface ProductEventDeliveryRepository extends JpaRepository<ProductEventDelivery, Long> {
    Optional<ProductEventDelivery> findByPlanId(Long eventId);
}
