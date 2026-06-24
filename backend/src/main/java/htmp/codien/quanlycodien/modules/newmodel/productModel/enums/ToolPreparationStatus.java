package htmp.codien.quanlycodien.modules.newmodel.productModel.enums;

public enum ToolPreparationStatus {
    NOT_STARTED("Chưa bắt đầu"),
    IN_PROGRESS("Đang chuẩn bị"),
    COMPLETED("Đã hoàn thành"),
    CANCELLED("Đã hủy");

    private final String displayName;

    ToolPreparationStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
