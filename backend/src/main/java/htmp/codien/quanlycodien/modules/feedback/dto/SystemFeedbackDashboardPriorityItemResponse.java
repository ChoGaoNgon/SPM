package htmp.codien.quanlycodien.modules.feedback.dto;

import java.time.LocalDateTime;

import htmp.codien.quanlycodien.common.enums.Priority;
import htmp.codien.quanlycodien.modules.feedback.enums.SystemFeedbackStatus;
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
public class SystemFeedbackDashboardPriorityItemResponse {
    Long id;
    String title;
    Priority priority;
    String module;
    String owner;
    SystemFeedbackStatus status;
    LocalDateTime createdAt;
}
