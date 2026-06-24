package htmp.codien.quanlycodien.modules.workschedule.dto.schedule;

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
public class DailyWorkScheduleStatsDTO {

    String date;

    long HC;
    long C1;
    long C2;
    long C3;
    long KO;
    long KD;

    long P;
    long NKL;
    long NT;
    long other;

    double percentWorking;
    double percentResting;
}
