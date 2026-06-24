package htmp.codien.quanlycodien.modules.newmodel.productModel.enums;

public enum ToolPreparationType {
    FIRST_PROCESS("First Process", "Tay gá và Bàn cắt"),
    SECOND_PROCESS("Second Process", "JIG");

    private final String code;
    private final String description;

    ToolPreparationType(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }
}
