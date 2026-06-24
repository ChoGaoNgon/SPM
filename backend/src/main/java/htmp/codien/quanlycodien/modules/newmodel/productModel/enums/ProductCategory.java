package htmp.codien.quanlycodien.modules.newmodel.productModel.enums;

public enum ProductCategory {

    FINISHED_ASSEMBLY("Thành phẩm - Lắp ráp", "#059669"),
    FINISHED_PRINT("Thành phẩm - In", "#10B981"),
    FINISHED_PAINT("Thành phẩm - Sơn", "#34D399"),
    FINISHED_LASER("Thành phẩm - Laser", "#6EE7B7"),
    FINISHED_HOT("Thành phẩm - Hot", "#A7F3D0"),
    FINISHED_INJECTION("Thành phẩm - Đúc", "#084a34"),

    SECOND_PROCESS_INJECTION("Bán thành phẩm - Đúc", "#60A5FA"),
    SECOND_PROCESS_PRINT("Bán thành phẩm - In", "#8B5CF6"),
    SECOND_PROCESS_PAINT("Bán thành phẩm - Sơn", "#F59E0B"),
    SECOND_PROCESS_HOT_STAMPING("Bán thành phẩm - Hot", "#EC4899"),
    SECOND_PROCESS_LASER("Bán thành phẩm - Laser", "#EF4444");

    private final String description;
    private final String color;

    ProductCategory(String description, String color) {
        this.description = description;
        this.color = color;
    }

    public String getDescription() {
        return description;
    }

    public String getColor() {
        return color;
    }
}
