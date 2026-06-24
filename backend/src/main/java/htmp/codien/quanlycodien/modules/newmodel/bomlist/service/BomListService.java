package htmp.codien.quanlycodien.modules.newmodel.bomlist.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.modules.newmodel.bomlist.dto.BomListApprovalRequest;
import htmp.codien.quanlycodien.modules.newmodel.bomlist.dto.BomListRequest;
import htmp.codien.quanlycodien.modules.newmodel.bomlist.dto.BomListResponse;

public interface BomListService {
    void createBomlist(Long modelId, BomListRequest req, MultipartFile uploadFile);

    void updateBomlist(Long id, BomListRequest req, MultipartFile uploadFile);

    BomListResponse getBomListById(Long id);

    void approvalBomlist(Long id, BomListApprovalRequest req);

    List<BomListResponse> getBomListByModelId(Long modelId);

    void deleteBomlist(Long id);
}
