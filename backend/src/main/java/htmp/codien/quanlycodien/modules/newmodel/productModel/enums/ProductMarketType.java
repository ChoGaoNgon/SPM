package htmp.codien.quanlycodien.modules.newmodel.productModel.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ProductMarketType {
    PRODUCTION_EXPORT("Sản xuất xuất khẩu"),
    VAT_BUSINESS("Kinh doanh (VAT)"),;

    private final String description;
}
