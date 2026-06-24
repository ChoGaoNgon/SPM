package htmp.codien.quanlycodien.modules.newmodel.productModel.enums;

public enum IssueType {
    MOLD_ERROR("Lỗi khuôn"),
    PRODUCT_ERROR("Lỗi sản phẩm");

    private final String description;

    IssueType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
