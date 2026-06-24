package htmp.codien.quanlycodien.modules.newmodel.productModel.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.sendMail.SendModelMailRequest;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductDTO;
import htmp.codien.quanlycodien.modules.newmodel.productModel.dto.ModelRequest;
import htmp.codien.quanlycodien.modules.newmodel.productModel.dto.ModelResponse;

public interface ModelService {
    void createModel(ModelRequest modelRequest);

    void updateModel(Long id, ModelRequest modelRequest);

    Page<ModelResponse> searchModels(Pageable pageable, String keyword);

    Page<ModelResponse> getAllModels(Pageable pageable);

    List<ProductDTO> getAllProductByModel(Long modelId);

    void deleteModel(Long id);

    Page<ModelResponse> searchByProductCodeOrMoldCode(Pageable pageable, String keyword);

    void approveAndSendMail(SendModelMailRequest request);

    ModelResponse getModelById(Long modelId);

    void importModelsFromExcel(MultipartFile file);
}