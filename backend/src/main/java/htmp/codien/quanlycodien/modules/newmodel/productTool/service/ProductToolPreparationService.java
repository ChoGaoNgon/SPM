package htmp.codien.quanlycodien.modules.newmodel.productTool.service;

import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ToolPreparationStatus;
import htmp.codien.quanlycodien.modules.newmodel.productTool.dto.ProductToolPreparationDTO;
import htmp.codien.quanlycodien.modules.newmodel.productTool.dto.ProductToolPreparationRequest;

import java.util.List;

public interface ProductToolPreparationService {

    void createToolPreparationsForProduct(Long productId);

    ProductToolPreparationDTO createToolPreparation(ProductToolPreparationRequest request);

    ProductToolPreparationDTO updateToolPreparation(Long id, ProductToolPreparationRequest request);

    List<ProductToolPreparationDTO> getToolPreparationsByProduct(Long productId);

    ProductToolPreparationDTO getToolPreparationById(Long id);

    void deleteToolPreparation(Long id);

    void updateStatus(Long id, ToolPreparationStatus status);

    boolean areAllToolsReady(Long productId);

    List<ProductToolPreparationDTO> getToolPreparationsByEmployee(Long employeeId);
}
