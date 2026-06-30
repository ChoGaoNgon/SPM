package htmp.codien.quanlycodien.modules.report.oeeReport.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellReference;

import htmp.codien.quanlycodien.infrastructure.context.SheetContext;
import htmp.codien.quanlycodien.modules.report.common.helper.ReportExcelHelper;
import htmp.codien.quanlycodien.modules.report.oeeReport.dto.MachineOperationReportDTO;
import htmp.codien.quanlycodien.modules.report.oeeReport.dto.MoldChangeReportDTO;
import htmp.codien.quanlycodien.modules.report.oeeReport.dto.ProductionIssueReportDTO;
import htmp.codien.quanlycodien.modules.report.oeeReport.dto.SetupReportDTO;

class OeeDungMaySheetWriter {

    private static final String ERROR_CODE_B1 = "B1";
    private static final String ERROR_CODE_B2 = "B2";
    private static final int FIND_START_ROW_MIN_STEP = 100;
    private static final int FIND_START_ROW_MAX_STEP = 1000;
    private static final int FIND_START_ROW_TARGET_BUCKETS = 400;
    private static final String UP_MACHINE = "Lên khuôn";
    void write(
            Workbook workbook,
            LocalDate date,
            List<MoldChangeReportDTO> moldChangeReportData,
            List<SetupReportDTO> setupReportData,
            List<ProductionIssueReportDTO> phatSinhReportData,
            List<MachineOperationReportDTO> machineOperationReportData) {
        Sheet sheetDungMay = workbook.getSheet("Dung may");
        if (sheetDungMay == null) {
            throw new RuntimeException("Khong tim thay sheet 'Dung may'");
        }

        SheetContext dungMayCtx = buildDungMayContext();
        int rowIdxDungMay = findStartRow(sheetDungMay, "B");
        Map<String, Row> baseRowMap = new HashMap<>();

        rowIdxDungMay = writeMoldChangeRows(
                sheetDungMay,
                dungMayCtx,
                rowIdxDungMay,
                date,
                moldChangeReportData,
                baseRowMap);

        rowIdxDungMay = writeSetupRows(
                sheetDungMay,
                dungMayCtx,
                rowIdxDungMay,
                date,
                setupReportData,
                baseRowMap);

        rowIdxDungMay = writeProductionIssueRows(
                sheetDungMay,
                dungMayCtx,
                rowIdxDungMay,
                date,
                phatSinhReportData,
                baseRowMap);

        writeMachineDowntimeRows(
                sheetDungMay,
                dungMayCtx,
                rowIdxDungMay,
                date,
                machineOperationReportData);
    }

    private SheetContext buildDungMayContext() {
        return ReportExcelHelper.buildContext("B", "C", "D", "E", "F", "G", "I", "Q");
    }

    private int writeMoldChangeRows(
            Sheet sheet,
            SheetContext ctx,
            int startRow,
            LocalDate date,
            List<MoldChangeReportDTO> data,
            Map<String, Row> baseRowMap) {
        int rowIdx = startRow;

        for (MoldChangeReportDTO item : data) {
            String key = item.getStt() + "_" + item.getMa_day_chuyen();

            if (ERROR_CODE_B1.equalsIgnoreCase(item.getMa_loi())) {
                Row row = createOrGetRow(sheet, rowIdx);
                writeMainRow(
                        row,
                        ctx,
                        date,
                        item.getMa_day_chuyen(),
                        item.getTg_bd_lenkhuon() == null ? null : item.getTg_bd_lenkhuon().toString(),
                        item.getTg_kt_lenkhuon() == null ? null : item.getTg_kt_lenkhuon().toString(),
                        item.getMa_loi(),
                        item.getTg_lenkhuon(),
                        item.getMa_vt(),
                        item.getGhi_chu_error());
                baseRowMap.put(key, row);
                rowIdx++;
            } else {
                BigDecimal minutes = item.getTg_xl() == null
                        ? BigDecimal.ZERO
                        : item.getTg_xl().divide(new BigDecimal(60), 2, RoundingMode.HALF_UP);

                Row row = createOrGetRow(sheet, rowIdx);
                writeMainRow(
                        row,
                        ctx,
                        date,
                        item.getMa_day_chuyen(),
                        item.getTg_bd_ghiloi() == null ? null : item.getTg_bd_ghiloi().toString(),
                        item.getTg_kt_ghiloi() == null ? null : item.getTg_kt_ghiloi().toString(),
                        item.getMa_loi(),
                        minutes,
                        item.getMa_vt(),
                        UP_MACHINE);
                rowIdx++;
            }
        }

        return rowIdx;
    }

    private int writeSetupRows(
            Sheet sheet,
            SheetContext ctx,
            int startRow,
            LocalDate date,
            List<SetupReportDTO> data,
            Map<String, Row> baseRowMap) {
        int rowIdx = startRow;

        for (SetupReportDTO item : data) {
            String key = item.getStt() + "_" + item.getMa_day_chuyen();

            if (ERROR_CODE_B2.equalsIgnoreCase(item.getMa_loi())) {
                Row row = createOrGetRow(sheet, rowIdx);
                writeMainRow(
                        row,
                        ctx,
                        date,
                        item.getMa_day_chuyen(),
                        item.getTg_bd_setup() == null ? null : item.getTg_bd_setup().toString(),
                        item.getTg_kt_setup() == null ? null : item.getTg_kt_setup().toString(),
                        item.getMa_loi(),
                        item.getTg_setup(),
                        item.getMa_sp(),
                        item.getGhi_chu_error());
                baseRowMap.put(key, row);
                rowIdx++;
            } else {
                Row baseRow = baseRowMap.get(key);
                if (baseRow != null) {
                    Cell noteCell = cell(baseRow, ctx, "Q");
                    String appendText = item.getMa_loi() + ": "
                            + item.getTg_xl().divide(new BigDecimal(60), RoundingMode.HALF_UP);
                    appendToNoteCell(noteCell, appendText);
                }
            }
        }

        return rowIdx;
    }

    private int writeProductionIssueRows(
            Sheet sheet,
            SheetContext ctx,
            int startRow,
            LocalDate date,
            List<ProductionIssueReportDTO> data,
            Map<String, Row> baseRowMap) {
        int rowIdx = startRow;

        for (ProductionIssueReportDTO item : data) {
            String key = item.getStt() + "_" + item.getMa_day_chuyen();
            Row row = createOrGetRow(sheet, rowIdx);

            writeMainRow(
                    row,
                    ctx,
                    date,
                    item.getMa_day_chuyen(),
                    item.getTg_bd_ghiloi() == null ? null : item.getTg_bd_ghiloi().toString(),
                    item.getTg_kt_ghiloi() == null ? null : item.getTg_kt_ghiloi().toString(),
                    item.getMa_loi(),
                    item.getTg_xl(),
                    item.getMa_vt(),
                    null);

            baseRowMap.put(key, row);
            rowIdx++;
        }

        return rowIdx;
    }

    private void writeMachineDowntimeRows(
            Sheet sheet,
            SheetContext ctx,
            int startRow,
            LocalDate date,
            List<MachineOperationReportDTO> machineOperationReportData) {
        int rowIdx = startRow;

        Map<String, List<MachineOperationReportDTO>> machineMap = machineOperationReportData
                .stream()
                .collect(Collectors.groupingBy(MachineOperationReportDTO::getMachine_code))
                .entrySet()
                .stream()
                .sorted(Comparator.comparing(entry -> parseTrailingNumber(entry.getKey())))
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> {
                            List<MachineOperationReportDTO> sorted = new ArrayList<>(entry.getValue());
                            sorted.sort(Comparator.comparing(item -> LocalDateTime.of(
                                    item.getCreate_date(),
                                    item.getCreate_time())));
                            return sorted;
                        },
                        (left, right) -> left,
                        LinkedHashMap::new));

        LocalTime shiftStartTime = LocalTime.of(8, 0);
        LocalTime ignoreEndTime = LocalTime.of(7, 40);
        LocalTime ignoreStartTime = LocalTime.of(8, 20);

        for (Map.Entry<String, List<MachineOperationReportDTO>> entry : machineMap.entrySet()) {
            String machineCode = entry.getKey();
            List<MachineOperationReportDTO> list = entry.getValue();
            if (list.isEmpty()) {
                continue;
            }

            MachineOperationReportDTO firstItem = list.get(0);
            LocalDateTime firstStart = LocalDateTime.of(firstItem.getCreate_date(), firstItem.getCreate_time());
            LocalDateTime shiftStart = LocalDateTime.of(date, shiftStartTime);
            LocalTime firstStartTime = firstStart.toLocalTime();

            if (firstStartTime.isAfter(ignoreStartTime) || firstStart.toLocalDate().isAfter(date)) {
                Duration downtime = Duration.between(shiftStart, firstStart);
                writeDowntimeRow(
                        sheet,
                        ctx,
                        rowIdx++,
                        date,
                        machineCode,
                        shiftStart,
                        firstStart,
                        downtime,
                        firstItem.getProduct_code());
            }

            for (int i = 0; i < list.size() - 1; i++) {
                MachineOperationReportDTO current = list.get(i);
                MachineOperationReportDTO next = list.get(i + 1);

                if (current.getEnd_date() == null
                        || current.getEnd_time() == null
                        || next.getCreate_date() == null
                        || next.getCreate_time() == null) {
                    continue;
                }

                LocalDateTime currentEnd = LocalDateTime.of(current.getEnd_date(), current.getEnd_time());
                LocalDateTime nextStart = LocalDateTime.of(next.getCreate_date(), next.getCreate_time());

                LocalTime endTime = currentEnd.toLocalTime();
                LocalTime startTime = nextStart.toLocalTime();

                boolean isShiftChange = !endTime.isBefore(ignoreEndTime)
                        && endTime.isBefore(shiftStartTime)
                        && !startTime.isBefore(shiftStartTime)
                        && !startTime.isAfter(ignoreStartTime);

                if (isShiftChange) {
                    continue;
                }

                Duration downtime = Duration.between(currentEnd, nextStart);
                if (downtime.isNegative() || downtime.isZero()) {
                    continue;
                }

                writeDowntimeRow(
                        sheet,
                        ctx,
                        rowIdx++,
                        date,
                        machineCode,
                        currentEnd,
                        nextStart,
                        downtime,
                        next.getProduct_code());
            }

            MachineOperationReportDTO lastItem = list.get(list.size() - 1);
            if (lastItem.getEnd_date() == null || lastItem.getEnd_time() == null) {
                continue;
            }

            LocalDateTime lastEnd = LocalDateTime.of(lastItem.getEnd_date(), lastItem.getEnd_time());
            LocalDateTime nextShiftStart = LocalDateTime.of(date.plusDays(1), shiftStartTime);
            if (!lastEnd.isBefore(nextShiftStart)) {
                continue;
            }

            LocalDateTime handoverStart = LocalDateTime.of(date.plusDays(1), ignoreEndTime);
            boolean isEndShiftHandover = !lastEnd.isBefore(handoverStart) && lastEnd.isBefore(nextShiftStart);
            if (isEndShiftHandover) {
                continue;
            }

            Duration downtime = Duration.between(lastEnd, nextShiftStart);
            if (!downtime.isNegative() && !downtime.isZero()) {
                writeDowntimeRow(
                        sheet,
                        ctx,
                        rowIdx++,
                        date,
                        machineCode,
                        lastEnd,
                        nextShiftStart,
                        downtime,
                        lastItem.getProduct_code());
            }
        }
    }

    private void writeDowntimeRow(
            Sheet sheet,
            SheetContext ctx,
            int rowIdx,
            LocalDate date,
            String machineCode,
            LocalDateTime from,
            LocalDateTime to,
            Duration downtime,
            String productCode) {
        Row row = createOrGetRow(sheet, rowIdx);
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");

        cell(row, ctx, "B").setCellValue(date);
        cell(row, ctx, "C").setCellValue(parseTrailingNumber(machineCode));
        cell(row, ctx, "D").setCellValue(from.format(timeFormatter));
        cell(row, ctx, "E").setCellValue(to.format(timeFormatter));

        double minutes = downtime.toSeconds() / 60.0;
        cell(row, ctx, "G").setCellValue(Double.parseDouble(String.format("%.2f", minutes)));
        cell(row, ctx, "I").setCellValue(productCode);
    }

    private void writeMainRow(
            Row row,
            SheetContext ctx,
            LocalDate date,
            String machineCode,
            String fromTime,
            String toTime,
            String errorCode,
            BigDecimal minutes,
            String productCode,
            String note) {
        cell(row, ctx, "B").setCellValue(date);
        cell(row, ctx, "C").setCellValue(parseTrailingNumber(machineCode));
        cell(row, ctx, "D").setCellValue(fromTime == null ? "" : fromTime);
        cell(row, ctx, "E").setCellValue(toTime == null ? "" : toTime);
        cell(row, ctx, "F").setCellValue(errorCode == null ? "" : errorCode);
        cell(row, ctx, "G").setCellValue(minutes == null ? 0 : minutes.doubleValue());
        cell(row, ctx, "I").setCellValue(productCode == null ? "" : productCode);
        if (note != null) {
            cell(row, ctx, "Q").setCellValue(note);
        }
    }

    private void appendToNoteCell(Cell noteCell, String appendText) {
        String oldValue = noteCell.getStringCellValue();
        if (oldValue == null || oldValue.isBlank()) {
            noteCell.setCellValue(appendText);
            return;
        }
        noteCell.setCellValue(oldValue + "; " + appendText);
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
        int step = resolveFindStartRowStep(lastRow - startDataRow + 1);

        for (int i = lastRow; i >= startDataRow; i -= step) {
            Row sampledRow = sheet.getRow(i);
            if (!isEmptyCellAtColumn(sampledRow, colIdx)) {
                int upperBound = Math.min(lastRow, i + step - 1);
                for (int j = upperBound; j > i; j--) {
                    Row row = sheet.getRow(j);
                    if (!isEmptyCellAtColumn(row, colIdx)) {
                        return j + 1;
                    }
                }
                return i + 1;
            }
        }

        for (int i = lastRow; i >= startDataRow; i--) {
            Row row = sheet.getRow(i);
            if (!isEmptyCellAtColumn(row, colIdx)) {
                return i + 1;
            }
        }

        return startDataRow;
    }

    private int resolveFindStartRowStep(int dataRange) {
        if (dataRange <= 0) {
            return FIND_START_ROW_MIN_STEP;
        }

        int adaptiveStep = dataRange / FIND_START_ROW_TARGET_BUCKETS;
        if (adaptiveStep < FIND_START_ROW_MIN_STEP) {
            return FIND_START_ROW_MIN_STEP;
        }
        if (adaptiveStep > FIND_START_ROW_MAX_STEP) {
            return FIND_START_ROW_MAX_STEP;
        }

        return adaptiveStep;
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
