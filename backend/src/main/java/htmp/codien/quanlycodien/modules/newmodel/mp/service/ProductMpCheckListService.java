package htmp.codien.quanlycodien.modules.newmodel.mp.service;

import htmp.codien.quanlycodien.modules.newmodel.mp.dto.productMpCheckList.ProductMpCheckItemRequest;
import htmp.codien.quanlycodien.modules.newmodel.mp.dto.productMpCheckList.ProductMpCheckListResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductMpCheckListService {

    void createMpCheckList(Long productId, String delayReason);

    ProductMpCheckListResponse getByProductId(Long productId);

    void deleteByProductId(Long productId);

    void updateCheckItem(Long checkItemId, ProductMpCheckItemRequest req, List<MultipartFile> uploadFiles,
                         String keptOldFilesJson, String deletedOldFilesJson);

    void approveCheckList(Long approvalId, String comment);

    void rejectCheckList(Long approvalId, String comment);

}
