package htmp.codien.quanlycodien.modules.report.oeeReport.service;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellReference;

import htmp.codien.quanlycodien.infrastructure.context.SheetContext;
import htmp.codien.quanlycodien.modules.report.common.helper.ReportExcelHelper;
import htmp.codien.quanlycodien.modules.report.oeeReport.dto.KhsxItemDTO;
import htmp.codien.quanlycodien.modules.report.oeeReport.dto.MachineOperationReportDTO;

class OeeKqsxSheetWriter {

    static final class WriteResult {
        private final Set<String> missingKhsxCodes;
        private final Set<String> fallbackQCodes;

        WriteResult(Set<String> missingKhsxCodes, Set<String> fallbackQCodes) {
            this.missingKhsxCodes = missingKhsxCodes;
            this.fallbackQCodes = fallbackQCodes;
        }

        Set<String> getMissingKhsxCodes() {
            return missingKhsxCodes;
        }

        Set<String> getFallbackQCodes() {
            return fallbackQCodes;
        }
    }

    WriteResult write(
            Workbook workbook,
            List<MachineOperationReportDTO> machineOperationReportDTOs,
            LocalDate date,
            Map<String, KhsxItemDTO> dataMap,
            Map<String, KhsxItemDTO> previousDayDataMap,
            WeekFields weekFields) {
        Sheet sheetKQSX = workbook.getSheet("KQSX");
        if (sheetKQSX == null) {
            throw new RuntimeException("Khong tim thay sheet 'KQSX'");
        }

        SheetContext kqsxCtx = buildContext();
        int rowIdxKQSX = findStartRow(sheetKQSX, "D");

        Set<String> missingKhsxCodes = new HashSet<>();
        Set<String> fallbackQCodes = new HashSet<>();

        for (MachineOperationReportDTO item : machineOperationReportDTOs) {
            Row row = createOrGetRow(sheetKQSX, rowIdxKQSX);

            cell(row, kqsxCtx, "B").setCellValue(date.getMonthValue());
            cell(row, kqsxCtx, "C").setCellValue(date.get(weekFields.weekOfYear()));
            cell(row, kqsxCtx, "D").setCellValue(date);
            cell(row, kqsxCtx, "J")
                    .setCellValue(item.getCavity_san_xuat() == null ? 0 : item.getCavity_san_xuat().doubleValue());
            cell(row, kqsxCtx, "N").setCellValue(parseTrailingNumber(item.getMachine_code()));
            cell(row, kqsxCtx, "P").setCellValue(item.getProduct_code());

            String productCode = item.getProduct_code();
            KhsxItemDTO khsxItem = dataMap.get(productCode);
            KhsxItemDTO previousDayKhsxItem = previousDayDataMap.get(productCode);

            if (khsxItem == null && productCode != null) {
                missingKhsxCodes.add(productCode);
            }

            Double chuKyKeHoach = getPositivePlannedCycle(khsxItem);
            if (chuKyKeHoach == null) {
                chuKyKeHoach = getPositivePlannedCycle(previousDayKhsxItem);
                if (chuKyKeHoach != null && productCode != null) {
                    fallbackQCodes.add(productCode);
                }
            }

            cell(row, kqsxCtx, "Q").setCellValue(chuKyKeHoach == null ? 0 : chuKyKeHoach);
            cell(row, kqsxCtx, "R")
                    .setCellValue(item.getChu_ky_setup() == null ? 0 : item.getChu_ky_setup().doubleValue());
            cell(row, kqsxCtx, "T")
                    .setCellValue(khsxItem == null || khsxItem.getSlTrongNgay() == null
                            ? 0
                            : khsxItem.getSlTrongNgay().doubleValue());
            cell(row, kqsxCtx, "AC")
                    .setCellValue(item.getSl_dong_goi() == null ? 0 : item.getSl_dong_goi().doubleValue());
            cell(row, kqsxCtx, "AO").setCellValue(item.getMa_khuon());

            rowIdxKQSX++;
        }

        return new WriteResult(missingKhsxCodes, fallbackQCodes);
    }

    private SheetContext buildContext() {
        return ReportExcelHelper.buildContext("B", "C", "D", "J", "N", "P", "Q", "R", "T", "AC", "AO");
    }

    private Double getPositivePlannedCycle(KhsxItemDTO item) {
        if (item == null || item.getChuKy() == null || item.getChuKy() <= 0) {
            return null;
        }

        return item.getChuKy();
    }

    private int parseTrailingNumber(String code) {
        return ReportExcelHelper.parseTrailingNumber(code);
    }

    private Row createOrGetRow(Sheet sheet, int rowIdx) {
        return ReportExcelHelper.createOrGetRow(sheet, rowIdx);
    }

    private Cell cell(Row row, SheetContext ctx, String col) {
        return ReportExcelHelper.getOrCreateWritableCell(row, ctx, col);
    }

    private int findStartRow(Sheet sheet, String column) {
        int startDataRow = 3;
        int lastRow = sheet.getLastRowNum();

        if (lastRow < startDataRow) {
            return startDataRow;
        }

        int colIdx = CellReference.convertColStringToIndex(column);
        for (int i = lastRow; i >= startDataRow; i--) {
            Row row = sheet.getRow(i);
            if (!isEmptyCellAtColumn(row, colIdx)) {
                return i + 1;
            }
        }

        return startDataRow;
    }

    private boolean isEmptyCellAtColumn(Row row, int colIdx) {
        if (row == null) {
            return true;
        }

        Cell cell = row.getCell(colIdx);
        if (cell == null) {
            return true;
        }

        CellType type = cell.getCellType();
        if (type == CellType.BLANK) {
            return true;
        }

        if (type == CellType.FORMULA) {
            try {
                String formula = cell.getCellFormula();
                return formula == null || formula.trim().isEmpty();
            } catch (Exception e) {
                return true;
            }
        }

        return false;
    }
}
