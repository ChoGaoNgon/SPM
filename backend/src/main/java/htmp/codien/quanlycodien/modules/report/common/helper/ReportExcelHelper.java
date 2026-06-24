package htmp.codien.quanlycodien.modules.report.common.helper;

import java.util.HashMap;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.util.CellReference;

import htmp.codien.quanlycodien.infrastructure.context.SheetContext;

public final class ReportExcelHelper {

    private ReportExcelHelper() {
    }

    public static SheetContext buildContext(String... columns) {
        Map<String, Integer> colIndexMap = new HashMap<>();
        for (String column : columns) {
            colIndexMap.put(column, CellReference.convertColStringToIndex(column));
        }
        return new SheetContext(colIndexMap);
    }

    public static int parseTrailingNumber(String code) {
        if (code == null || code.trim().isEmpty()) {
            return 0;
        }

        String normalized = code.trim();
        int separatorIdx = normalized.lastIndexOf('-');
        String numericPart = separatorIdx >= 0 ? normalized.substring(separatorIdx + 1) : normalized;
        return Integer.parseInt(numericPart.trim());
    }

    public static Row createOrGetRow(Sheet sheet, int rowIdx) {
        Row row = sheet.getRow(rowIdx);
        if (row == null) {
            row = sheet.createRow(rowIdx);
        }
        return row;
    }

    public static Cell getOrCreateWritableCell(Row row, SheetContext ctx, String col) {
        int idx = ctx.col(col);
        Cell cell = row.getCell(idx);
        if (cell == null) {
            cell = row.createCell(idx);
        } else if (cell.getCellType() == CellType.FORMULA) {
            cell.setBlank();
        }
        return cell;
    }

    public static String getString(Row row, SheetContext ctx, String col) {
        Cell cell = row.getCell(ctx.col(col));
        if (cell == null) {
            return "";
        }

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> "";
        };
    }

    public static Double getDouble(Row row, SheetContext ctx, String col) {
        Cell cell = row.getCell(ctx.col(col));
        if (cell == null) {
            return 0.0;
        }

        return switch (cell.getCellType()) {
            case STRING -> {
                try {
                    yield Double.parseDouble(cell.getStringCellValue().trim());
                } catch (NumberFormatException e) {
                    yield 0.0;
                }
            }
            case NUMERIC -> cell.getNumericCellValue();
            case BOOLEAN -> cell.getBooleanCellValue() ? 1.0 : 0.0;
            case FORMULA -> {
                try {
                    yield Double.parseDouble(cell.getCellFormula().trim());
                } catch (NumberFormatException e) {
                    yield 0.0;
                }
            }
            default -> 0.0;
        };
    }
}