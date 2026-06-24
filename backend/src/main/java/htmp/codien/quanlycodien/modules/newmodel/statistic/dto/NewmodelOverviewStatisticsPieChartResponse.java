package htmp.codien.quanlycodien.modules.newmodel.statistic.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NewmodelOverviewStatisticsPieChartResponse {
    Long totalProducts;
    Long moldTrialProductCount;
    Long eventProductCount;
    Long secondProcessProductCount;
    Long mpProductCount;
}
