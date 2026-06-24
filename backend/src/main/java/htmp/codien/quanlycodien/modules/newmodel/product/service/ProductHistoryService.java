package htmp.codien.quanlycodien.modules.newmodel.product.service;


import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductHistoryResponse;

import java.util.List;

public interface ProductHistoryService {

    List<ProductHistoryResponse> getProductHistoryByFieldName(Long productId, String fieldName);
}
