package htmp.codien.quanlycodien.modules.workschedule.helper;

import java.util.Set;

public class OffShifts {

    public static final Set<String> OFF_SHIFT_CODES = Set.of(
            "NT",
            "L",
            "P",
            "NB",
            "NKL",
            "PLD",
            "DLBT",
            "NPL",
            "NS");

    public static boolean isOffShift(String shiftCode) {
        return OFF_SHIFT_CODES.contains(shiftCode);
    }
}
