package htmp.codien.quanlycodien.modules.newmodel.productModel.enums;

public enum IssueStatus {
    BEFORE("Trước khắc phục"),
    AFTER("Sau khắc phục");

    private final String description;

    IssueStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
