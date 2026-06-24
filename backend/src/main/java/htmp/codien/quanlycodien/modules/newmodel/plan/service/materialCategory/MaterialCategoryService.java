package htmp.codien.quanlycodien.modules.newmodel.plan.service.materialCategory;

import java.util.List;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.suppliesHtmp.SuppliesHTMPDTO;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductResinMappingDTO;

public interface MaterialCategoryService {
    List<ProductResinMappingDTO> getResin(String materialCode);

    List<SuppliesHTMPDTO> getSupplies(String keyword);
}
