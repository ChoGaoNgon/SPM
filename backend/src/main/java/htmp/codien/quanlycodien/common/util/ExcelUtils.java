package htmp.codien.quanlycodien.common.util;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import java.util.Date;

public class ExcelUtils {

    public static String getCellString(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null)
            return "";

        try {
            return switch (cell.getCellType()) {
                case STRING -> cell.getStringCellValue().trim();
                case NUMERIC -> String.valueOf(cell.getNumericCellValue());
                case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
                case FORMULA -> getFormulaString(cell);
                default -> "";
            };
        } catch (Exception e) {
            return "";
        }
    }

    private static String getFormulaString(Cell cell) {
        return switch (cell.getCachedFormulaResultType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    public static Double getCellDouble(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null)
            return null;

        try {
            return switch (cell.getCellType()) {
                case NUMERIC -> cell.getNumericCellValue();
                case STRING -> parseDouble(cell.getStringCellValue());
                case FORMULA -> getFormulaDouble(cell);
                default -> null;
            };
        } catch (Exception e) {
            return null;
        }
    }

    private static Double getFormulaDouble(Cell cell) {
        return switch (cell.getCachedFormulaResultType()) {
            case NUMERIC -> cell.getNumericCellValue();
            case STRING -> parseDouble(cell.getStringCellValue());
            default -> null;
        };
    }

    public static Integer getCellInteger(Row row, int index) {
        Double val = getCellDouble(row, index);
        return val == null ? null : val.intValue();
    }

    public static Long getCellLong(Row row, int index) {
        Double val = getCellDouble(row, index);
        return val == null ? null : val.longValue();
    }

    public static Boolean getCellBoolean(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null)
            return false;

        return switch (cell.getCellType()) {
            case BOOLEAN -> cell.getBooleanCellValue();
            case STRING -> Boolean.parseBoolean(cell.getStringCellValue().trim());
            default -> false;
        };
    }

    public static LocalDate getCellDate(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null)
            return null;

        try {
            if (DateUtil.isCellDateFormatted(cell)) {
                return cell.getDateCellValue()
                        .toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate();
            }

            if (cell.getCellType() == CellType.STRING) {
                String s = cell.getStringCellValue().trim();
                return s.isEmpty() ? null : LocalDate.parse(s);
            }

        } catch (Exception ignored) {
        }

        return null;
    }

    public static String getTrimmedString(Cell cell) {
        return cell == null ? "" : cell.toString().trim();
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> getMap(Map<String, Object> row, String key) {
        if (row == null)
            return null;
        return (Map<String, Object>) row.get(key);
    }

    public static String getString(Map<String, Object> row, String key) {
        Object val = row.get(key);
        return val == null ? null : val.toString().trim();
    }

    public static Integer getInteger(Map<String, Object> row, String key) {
        Object val = row.get(key);
        if (val == null)
            return null;

        try {
            if (val instanceof Number n)
                return n.intValue();
            return Integer.parseInt(val.toString());
        } catch (Exception e) {
            return null;
        }
    }

    public static Double getDouble(Map<String, Object> row, String key) {
        Object val = row.get(key);
        if (val == null)
            return null;

        try {
            if (val instanceof Number n)
                return n.doubleValue();
            return Double.parseDouble(val.toString());
        } catch (Exception e) {
            return null;
        }
    }

    public static Boolean getBoolean(Map<String, Object> row, String key) {
        Object val = row.get(key);
        if (val == null)
            return false;

        if (val instanceof Boolean b)
            return b;
        return Boolean.parseBoolean(val.toString());
    }

    private static Double parseDouble(String s) {
        if (s == null || s.trim().isEmpty())
            return null;
        return Double.parseDouble(s.trim());
    }

    public static BigDecimal toBigDecimal(Double value) {
        return value == null ? null : BigDecimal.valueOf(value);
    }

    public static LocalDate toDate(Object value) {
        if (value == null)
            return null;

        try {
            if (value instanceof Date date) {
                return date.toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate();
            }

            if (value instanceof String str) {
                str = str.trim();
                if (str.isEmpty())
                    return null;

                return LocalDate.parse(str);
            }

            if (value instanceof Number n) {
                Date date = org.apache.poi.ss.usermodel.DateUtil.getJavaDate(n.doubleValue());
                return date.toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate();
            }

        } catch (Exception e) {
            return null;
        }

        return null;
    }

    public static boolean hasData(Map<String, Object> map, String... keys) {
    if (map == null) return false;

    for (String key : keys) {
        Object val = map.get(key);
        if (val != null && !val.toString().trim().isEmpty()) {
            return true;
        }
    }
    return false;
}
}