package htmp.codien.quanlycodien.modules.newmodel.product.enums;

public enum FileUploadProductType {
    DEFAULT(""),
    ISSUE("issue"),
    FA("fa"),
    BOMLIST("bomlist");

    private final String folderName;

    FileUploadProductType(String folderName) {
        this.folderName = folderName;
    }

    public String getFolderName() {
        return folderName;
    }
}