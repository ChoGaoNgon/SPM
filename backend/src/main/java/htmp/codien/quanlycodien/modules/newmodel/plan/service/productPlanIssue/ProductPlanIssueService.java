
package htmp.codien.quanlycodien.modules.newmodel.plan.service.productPlanIssue;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productMoldTrialPlanIssue.ProductPlanIssueCreationRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productMoldTrialPlanIssue.ProductPlanIssueDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productMoldTrialPlanIssue.ProductPlanIssueResponse;

public interface ProductPlanIssueService {
        void createPlanIssue(Long planId, ProductPlanIssueCreationRequest req,
                        List<MultipartFile> beforeFiles, List<MultipartFile> afterFiles,
                        String keptOldFilesJson, String deletedOldFilesJson);

        void updatePlanIssue(Long id, ProductPlanIssueCreationRequest req,
                        List<MultipartFile> beforeFiles, List<MultipartFile> afterFiles,
                        String keptOldFilesJson, String deletedOldFilesJson);

        List<ProductPlanIssueResponse> getAllIssuesByPlanId(Long planId);

        List<ProductPlanIssueDTO> getAllIssues();

        void deletePlanIssue(Long id);
}