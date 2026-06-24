package htmp.codien.quanlycodien.modules.newmodel.plan.service;

import java.util.List;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productDefectCode.ProductDefectCodeDTO;

public interface ProductDefectCodeService {
    String syncDefects();

    List<ProductDefectCodeDTO> getAll();

}
