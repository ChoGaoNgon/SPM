package htmp.codien.quanlycodien.modules.newmodel.statistic.dto;

import java.util.List;

import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductDTO;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.TypePlan;
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
public class NewmodelOverviewStatisticsDetailResponse {
    TypePlan typePlan;
    List<ProductDTO> products;
}
