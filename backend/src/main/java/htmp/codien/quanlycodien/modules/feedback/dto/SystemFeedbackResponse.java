package htmp.codien.quanlycodien.modules.feedback.dto;

import java.time.LocalDateTime;
import java.util.List;

import htmp.codien.quanlycodien.modules.feedback.entity.SystemFeedbackFile;
import htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus;
import htmp.codien.quanlycodien.modules.feedback.enums.SystemRequestType;
import htmp.codien.quanlycodien.common.enums.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class SystemFeedbackResponse {
    Long id;
    String title;
    String content;
    SystemRequestType requestType;
    SystemFeedbackStatus status;
    Priority priority;
    String response;
    String module;
    String createdByEmployeeCode;
    String createdByEmployeeName;
    LocalDateTime createdAt;
    Long assignToEmployeeId;
    String assignToEmployeeCode;
    String assignToEmployeeName;
    String impactScope;
    String primaryObjective;
    String expectedOutcome;
    LocalDateTime startTime;
    LocalDateTime endTime;
    String remark;
    List<SystemFeedbackFile> files;
}
