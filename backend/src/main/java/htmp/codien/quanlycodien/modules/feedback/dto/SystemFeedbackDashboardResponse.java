package htmp.codien.quanlycodien.modules.feedback.dto;

import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SystemFeedbackDashboardResponse {
    SystemFeedbackDashboardStatsResponse stats;
    List<SystemFeedbackDashboardTypeResponse> types;
    List<SystemFeedbackDashboardModuleResponse> modules;
    List<SystemFeedbackDashboardDepartmentResponse> departments;
    List<SystemFeedbackDashboardEmployeeResponse> employees;
    List<SystemFeedbackDashboardPriorityItemResponse> pendingList;
}
