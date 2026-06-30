package htmp.codien.quanlycodien.modules.report.oeeReport.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellReference;

import htmp.codien.quanlycodien.infrastructure.context.SheetContext;
import htmp.codien.quanlycodien.modules.report.common.helper.ReportExcelHelper;
import htmp.codien.quanlycodien.modules.report.oeeReport.dto.MachineOperationReportDTO;
import htmp.codien.quanlycodien.modules.report.oeeReport.dto.NgReportDTO;
import htmp.codien.quanlycodien.modules.report.oeeReport.dto.SetupReportDTO;

class OeeNhapNgSheetWriter {

    void write(
            Workbook workbook,
            List<NgReportDTO> ngReportData,
            List<MachineOperationReportDTO> machineOperationReportDTOs,
            List<SetupReportDTO> setupReportData,
            LocalDate date,
            WeekFields weekFields) {
        Sheet sheet = workbook.getSheet("Nhap NG");
        if (sheet == null) {
            throw new RuntimeException("Khong tim thay sheet 'Nhap NG'");
        }

        SheetContext ngCtx = buildContext();
        int rowIdx = findStartRow(sheet, "C");

        for (NgReportDTO item : ngReportData) {
            Row row = createOrGetRow(sheet, rowIdx);
            cell(row, ngCtx, "A").setCellValue(date.getMonthValue());
            cell(row, ngCtx, "B").setCellValue(date.get(weekFields.weekOfYear()));
            cell(row, ngCtx, "C").setCellValue(date);
            cell(row, ngCtx, "D").setCellValue(parseTrailingNumber(item.getLine_code()));
            cell(row, ngCtx, "F").setCellValue(item.getProduct_code());
            cell(row, ngCtx, "M").setCellValue(item.getTen_loi());
            cell(row, ngCtx, "N").setCellValue(item.getNg_qty().doubleValue());
            rowIdx++;
        }

        for (MachineOperationReportDTO item : machineOperationReportDTOs) {
            if (item.getSkip_shot() == null || item.getSkip_shot().compareTo(BigDecimal.ZERO) == 0) {
                continue;
            }

            Row row = createOrGetRow(sheet, rowIdx);
            cell(row, ngCtx, "C").setCellValue(java.sql.Date.valueOf(date));
            cell(row, ngCtx, "D").setCellValue(parseTrailingNumber(item.getMachine_code()));
            cell(row, ngCtx, "F").setCellValue(item.getProduct_code());
            cell(row, ngCtx, "M").setCellValue("Chay lai may (Bo shot)");
            cell(row, ngCtx, "O").setCellValue(item.getSkip_shot().doubleValue());
            rowIdx++;
        }

        // Gom theo (ma_day_chuyen, ma_sp): cong don number_shot
        LinkedHashMap<String, SetupReportDTO> mergedSetupByKey = new LinkedHashMap<>();
        for (SetupReportDTO item : setupReportData) {
            String key = buildSetupDistinctKey(item);
            BigDecimal numberShot = item.getNumber_shot() == null ? BigDecimal.ZERO : item.getNumber_shot();
            SetupReportDTO acc = mergedSetupByKey.get(key);
            if (acc == null) {
                mergedSetupByKey.put(key, SetupReportDTO.builder()
                        .ma_day_chuyen(item.getMa_day_chuyen())
                        .ma_sp(item.getMa_sp())
                        .number_shot(numberShot)
                        .build());
            } else {
                acc.setNumber_shot(acc.getNumber_shot().add(numberShot));
            }
        }

        // Sau khi sum xong, sap xep tang dan theo ma_day_chuyen
        List<SetupReportDTO> sortedSetupData = new ArrayList<>(mergedSetupByKey.values());
        sortedSetupData.sort(Comparator.comparing(
                SetupReportDTO::getMa_day_chuyen,
                Comparator.nullsLast(String::compareTo)));

        for (SetupReportDTO item : sortedSetupData) {
            Row row = createOrGetRow(sheet, rowIdx);
            cell(row, ngCtx, "C").setCellValue(java.sql.Date.valueOf(date));
            cell(row, ngCtx, "D").setCellValue(parseTrailingNumber(item.getMa_day_chuyen()));
            cell(row, ngCtx, "F").setCellValue(item.getMa_sp());
            cell(row, ngCtx, "M").setCellValue("Bỏ shot (setup máy)");
            if (item.getNumber_shot() != null) {
                cell(row, ngCtx, "O").setCellValue(item.getNumber_shot().doubleValue());
            }
            rowIdx++;
        }
    }

    private SheetContext buildContext() {
        return ReportExcelHelper.buildContext("A", "B", "C", "D", "F", "M", "N", "O");
    }

    private String buildSetupDistinctKey(SetupReportDTO item) {
        String maDayChuyen = item.getMa_day_chuyen() == null ? "" : item.getMa_day_chuyen().trim();
        String maSp = item.getMa_sp() == null ? "" : item.getMa_sp().trim();
        return maDayChuyen + "|" + maSp;
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
