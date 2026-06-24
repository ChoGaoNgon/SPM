package htmp.codien.quanlycodien.modules.newmodel.product.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ProductStatus {
    MAKE_MOLD("Đang làm khuôn"),
    TRIAL_MOLD("Đang thử khuôn"),
    EVENT("Đang chạy sự kiện"),
    MP_WAITTING("Đợi duyệt MP"),
    MP("Sản xuất hàng loạt"),
    MP_CANCELED("Hủy MP"),
    CLOSED("Đóng");

    private final String description;

}
