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
public class SystemFeedbackSummaryResponse {
    Long id;
    String title;
    SystemRequestType requestType;
    SystemFeedbackStatus status;
    Priority priority;
    String module;
    String createdByEmployeeCode;
    String createdByEmployeeName;
    LocalDateTime createdAt;
    Long assignToEmployeeId;
    String assignToEmployeeCode;
    String assignToEmployeeName;
}