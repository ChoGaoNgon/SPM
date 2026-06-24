package htmp.codien.quanlycodien.modules.feedback.dto;

import java.time.LocalDateTime;

import htmp.codien.quanlycodien.common.enums.Priority;
import htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus;
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
public class SystemFeedbackAssignRequest {
    Long assignToEmployeeId;
    Priority priority;
    SystemFeedbackStatus status;
    LocalDateTime startTime;
    LocalDateTime endTime;
    String remark;
}