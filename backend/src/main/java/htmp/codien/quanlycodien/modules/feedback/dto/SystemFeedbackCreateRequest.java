package htmp.codien.quanlycodien.modules.feedback.dto;

import java.time.LocalDateTime;

import htmp.codien.quanlycodien.common.enums.Priority;
import htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus;
import htmp.codien.quanlycodien.modules.feedback.enums.SystemRequestType;
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
public class SystemFeedbackCreateRequest {
    String title;
    String content;
    SystemRequestType requestType;
    Priority priority;
    SystemFeedbackStatus status;
    String response;
    String module;
    String impactScope;
    String primaryObjective;
    String expectedOutcome;
    LocalDateTime startTime;
    LocalDateTime endTime;
    String remark;
}
