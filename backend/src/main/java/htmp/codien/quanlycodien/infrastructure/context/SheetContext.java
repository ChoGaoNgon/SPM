package htmp.codien.quanlycodien.infrastructure.context;

import java.util.Map;

public class SheetContext {

    private final Map<String, Integer> colIndexMap;

    public SheetContext(Map<String, Integer> colIndexMap) {
        this.colIndexMap = colIndexMap;
    }

    public int col(String columnName) {
        Integer idx = colIndexMap.get(columnName);

        if (idx == null) {
            throw new IllegalArgumentException("Không tìm thấy cột: " + columnName);
        }

        return idx;
    }
}