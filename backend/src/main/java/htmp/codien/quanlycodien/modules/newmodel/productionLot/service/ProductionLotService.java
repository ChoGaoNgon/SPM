package htmp.codien.quanlycodien.modules.newmodel.productionLot.service;

import java.util.List;

import htmp.codien.quanlycodien.modules.newmodel.productionLot.dto.ProductionLotRequest;
import htmp.codien.quanlycodien.modules.newmodel.productionLot.dto.ProductionLotResponse;

public interface ProductionLotService {

    void createProductionLot(ProductionLotRequest request);

    void updateProductionLot(Long id, ProductionLotRequest request);

    void deleteProductionLot(Long id);

    ProductionLotResponse getProductionLotById(Long id);

    List<ProductionLotResponse> getAllProductionLots();

    List<ProductionLotResponse> getProductionLotsByProductPlan(Long productPlanId);

}