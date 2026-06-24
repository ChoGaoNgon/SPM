package htmp.codien.quanlycodien.modules.workschedule.dto.schedule;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ExternalWorkScheduleDTO {
    private Map<String, Map<String, String>> data;
}
