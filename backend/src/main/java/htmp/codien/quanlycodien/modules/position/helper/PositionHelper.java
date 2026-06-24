package htmp.codien.quanlycodien.modules.position.helper;

import java.util.List;

public class PositionHelper {

    private static final List<String> LEVEL_1_CODES = List.of("NVHTQL", "NVCC", "GS", "GSCC", "TC");
    private static final List<String> DEPARTMENT_HEAD_CODES = List.of("TRP", "PP");

    public static boolean isLevel1Manager(String positionCode) {
        return LEVEL_1_CODES.contains(positionCode);
    }

    public static boolean isDepartmentHead(String positionCode) {
        return DEPARTMENT_HEAD_CODES.contains(positionCode);
    }
}
