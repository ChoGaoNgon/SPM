package htmp.codien.quanlycodien.modules.report.oeeReport.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OeeReportFilterRequest {

    String dfrom;
    String dto;

    String timeFrom;
    String timeTo;

    String machineCode;

    Integer limit;
    Integer offset;
}
