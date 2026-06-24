package htmp.codien.quanlycodien.modules.newmodel.productModel.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MPTypeCheck {

    SAFETY("An toàn"),
    QUALITY("Chất lượng"),
    COST("Chi phí"),
    DELIVERY("Giao hàng"),
    DOCUMENT("Tài liệu");

    private final String description;
}