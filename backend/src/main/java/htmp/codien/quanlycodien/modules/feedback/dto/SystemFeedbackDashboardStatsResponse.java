package htmp.codien.quanlycodien.modules.feedback.dto;

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
public class SystemFeedbackDashboardStatsResponse {
    long total;
    long pending;
    long inProgress;
    long done;
    long rejected;
}
