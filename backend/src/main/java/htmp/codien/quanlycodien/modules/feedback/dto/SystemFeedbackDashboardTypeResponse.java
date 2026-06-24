package htmp.codien.quanlycodien.modules.feedback.dto;

import htmp.codien.quanlycodien.modules.feedback.enums.SystemRequestType;
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
public class SystemFeedbackDashboardTypeResponse {
    SystemRequestType type;
    long count;
}
