package htmp.codien.quanlycodien.modules.feedback.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackAssignRequest;
import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackCreateRequest;
import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackDashboardResponse;
import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackResponse;
import htmp.codien.quanlycodien.modules.feedback.dto.SystemFeedbackSummaryResponse;
import htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus;

public interface SystemFeedbackService {

        Void createFeedback(SystemFeedbackCreateRequest req, List<MultipartFile> uploadFiles,
                        String keptOldFilesJson, String deletedOldFilesJson);

        void updateFeedback(Long id, SystemFeedbackCreateRequest req, List<MultipartFile> uploadFiles,
                        String keptOldFilesJson, String deletedOldFilesJson);

        List<SystemFeedbackSummaryResponse> getAllFeedbacks(String employeeCode, List<SystemFeedbackStatus> statuses);

        void assignFeedback(Long id, SystemFeedbackAssignRequest request);

        SystemFeedbackResponse getFeedbackById(Long id);

        SystemFeedbackDashboardResponse getDashboardData();

        List<SystemFeedbackSummaryResponse> searchFeedbacks(String keyword, String employeeCode,
                        List<SystemFeedbackStatus> statuses);

        void deleteFeedback(Long id);
}
