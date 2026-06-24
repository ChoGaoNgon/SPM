package htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan;

import java.time.LocalDate;
import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MoldTrialWeeklyStatisticsResponse {
    String periodType;
    Integer year;
    Integer month;
    Integer week;
    LocalDate fromDate;
    LocalDate toDate;
    Long totalMoldTrials;
    Long totalOkMoldTrials;
    Long totalNgMoldTrials;
    List<MoldTrialWeeklyCustomerStatDTO> customers;
}