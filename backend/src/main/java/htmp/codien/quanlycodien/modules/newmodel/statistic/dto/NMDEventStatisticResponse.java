
package htmp.codien.quanlycodien.modules.newmodel.statistic.dto;

import java.util.List;

import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductSummary;
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
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class NMDEventStatisticResponse {
    String eventName;
    Integer totalProducts;
    List<ProductSummary> products;
}
