package htmp.codien.quanlycodien.modules.report.planDowntime.service;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.infrastructure.context.SheetContext;
import htmp.codien.quanlycodien.modules.report.common.helper.ReportExcelHelper;
import htmp.codien.quanlycodien.modules.report.planDowntime.dto.MachineDowntimeWrapper;
import htmp.codien.quanlycodien.modules.report.planDowntime.dto.MachineSession;
import htmp.codien.quanlycodien.modules.report.planDowntime.dto.TimeRange;

@Service
public class ProductionPlanDowntimeServiceImpl
        implements ProductionPlanDowntimeService {

    static final String PLAN_SHEET_NAME = "KH_TODAY";
    static final int START_ROW = 7;

    static final String[] REPORT_HEADERS = {
            "Số máy",
            "Tổng thời gian dừng"
    };

    @Override
    public void exportMachineDowntimeReportToExcel(
            MultipartFile file,
            OutputStream os) throws Exception {

        try (
                InputStream is = file.getInputStream();
                Workbook inputWorkbook = WorkbookFactory.create(is);
                Workbook outputWorkbook = new XSSFWorkbook()) {

            Sheet planSheet = inputWorkbook.getSheet(PLAN_SHEET_NAME);
            if (planSheet == null) {
                throw new RuntimeException("Không tìm thấy sheet: " + PLAN_SHEET_NAME);
            }

            Sheet reportSheet = outputWorkbook.createSheet("Downtime Report");
            Row header = reportSheet.createRow(0);
            for (int i = 0; i < REPORT_HEADERS.length; i++) {
                header.createCell(i).setCellValue(REPORT_HEADERS[i]);
            }

            /*
             * Sheet clone - Phút dừng = (24 - ΣY) * 60 (KHÔNG trừ ΣBO)
             */
            Sheet reportSheetNoMoldChange = outputWorkbook.createSheet("DMKH");
            Row headerNoMoldChange = reportSheetNoMoldChange.createRow(0);
            for (int i = 0; i < REPORT_HEADERS.length; i++) {
                headerNoMoldChange.createCell(i).setCellValue(REPORT_HEADERS[i]);
            }

            /*
             * Sheet 2 - Missing Hours
             */
            Sheet missingHoursSheet = outputWorkbook.createSheet("Missing Hours");

            Row missingHeader = missingHoursSheet.createRow(0);
            missingHeader.createCell(0).setCellValue("Máy");
            missingHeader.createCell(1).setCellValue("Thời gian dừng");
            missingHeader.createCell(2).setCellValue("Tổng phút dừng");

            SheetContext ctx = ReportExcelHelper.buildContext("A", "B", "E", "Y", "BI", "BJ", "BO");

            Map<String, List<MachineDowntimeWrapper>> downtimeData = processDowntimeData(planSheet, ctx);

            int reportRowIndex = 1;
            int reportRowIndexNoMoldChange = 1;

            for (Map.Entry<String, List<MachineDowntimeWrapper>> entry : downtimeData.entrySet()) {
                String machineCode = entry.getKey();
                List<MachineDowntimeWrapper> machineDowntimes = entry.getValue();

                double totalDurationHour = 0d;
                double totalChangeMoldMinutes = 0d;
                Set<String> countedMoldCodes = new HashSet<>();

                for (MachineDowntimeWrapper wrapper : machineDowntimes) {
                    String moldCode = wrapper.getMoldCode() == null ? "" : wrapper.getMoldCode().trim();
                    if (countedMoldCodes.add(moldCode)) {
                        totalDurationHour += wrapper.getDurationHour() == null ? 0d : wrapper.getDurationHour();
                        totalChangeMoldMinutes += wrapper.getTotalChangeMoldMinutes() == null ? 0d
                                : wrapper.getTotalChangeMoldMinutes();
                    }
                }

                if (machineCode.isBlank() || (totalDurationHour == 0d && totalChangeMoldMinutes == 0d)) {
                    continue;
                }

                double totalDowntimeMinutes = Math
                        .round((((24d - totalDurationHour) * 60d) - totalChangeMoldMinutes) * 100d) / 100d;

                Row reportRow = reportSheet.createRow(reportRowIndex++);
                setMachineCodeCellValue(reportRow, machineCode);
                reportRow.createCell(1).setCellValue(totalDowntimeMinutes);

                /*
                 * Sheet clone: Phút dừng = (24 - ΣY) * 60, không trừ ΣBO
                 */
                double totalDowntimeMinutesNoMoldChange = Math
                        .round(((24d - totalDurationHour) * 60d) * 100d) / 100d;

                Row reportRowNoMoldChange = reportSheetNoMoldChange.createRow(reportRowIndexNoMoldChange++);
                setMachineCodeCellValue(reportRowNoMoldChange, machineCode);
                reportRowNoMoldChange.createCell(1).setCellValue(totalDowntimeMinutesNoMoldChange);
            }

            for (int i = 0; i < REPORT_HEADERS.length; i++) {
                reportSheet.autoSizeColumn(i);
                reportSheetNoMoldChange.autoSizeColumn(i);
            }

            getMachinesWithMissingHours(planSheet, missingHoursSheet, ctx);

            outputWorkbook.write(os);
        }
    }

    Map<String, List<MachineDowntimeWrapper>> processDowntimeData(
            Sheet planSheet,
            SheetContext ctx) {

        Map<String, List<MachineDowntimeWrapper>> wrapperByMachineCode = new LinkedHashMap<>();

        for (int i = START_ROW; i <= planSheet.getLastRowNum(); i++) {
            Row row = planSheet.getRow(i);
            if (row == null) {
                continue;
            }

            String machineNumber = ReportExcelHelper.getString(row, ctx, "B");
            String moldCode = ReportExcelHelper.getString(row, ctx, "E");
            Double durationHour = ReportExcelHelper.getDouble(row, ctx, "Y");
            Double totalChangeMoldMinutes = ReportExcelHelper.getDouble(row, ctx, "BO");

            String normalizedMachineCode = normalizeMachineCode(machineNumber);
            if (normalizedMachineCode.isEmpty()) {
                continue;
            }

            MachineDowntimeWrapper wrapper = new MachineDowntimeWrapper();
            wrapper.setMachineCode(normalizedMachineCode);
            wrapper.setMoldCode(moldCode);
            wrapper.setDurationHour(durationHour);
            wrapper.setTotalChangeMoldMinutes(totalChangeMoldMinutes);

            wrapperByMachineCode
                    .computeIfAbsent(normalizedMachineCode, k -> new java.util.ArrayList<>())
                    .add(wrapper);

        }

        return wrapperByMachineCode;
    }

    String normalizeMachineCode(String rawMachineCode) {
        if (rawMachineCode == null) {
            return "";
        }

        String value = rawMachineCode.trim();
        if (value.isEmpty()) {
            return "";
        }

        String compact = value.replace(" ", "");

        if (compact.matches("[-+]?\\d+([\\.,]\\d+)?")) {
            int dotIdx = compact.indexOf('.');
            int commaIdx = compact.indexOf(',');
            int cutIdx;

            if (dotIdx >= 0 && commaIdx >= 0) {
                cutIdx = Math.min(dotIdx, commaIdx);
            } else {
                cutIdx = Math.max(dotIdx, commaIdx);
            }

            return cutIdx >= 0 ? compact.substring(0, cutIdx) : compact;
        }

        return compact;
    }

    void setMachineCodeCellValue(Row row, String machineCode) {
        try {
            row.createCell(0).setCellValue(Double.parseDouble(machineCode));
        } catch (NumberFormatException ex) {
            row.createCell(0).setCellValue(machineCode);
        }
    }

    void getMachinesWithMissingHours(
            Sheet planSheet,
            Sheet reportSheet,
            SheetContext ctx) {

        Map<String, List<MachineSession>> machineMap = new LinkedHashMap<>();

        /*
         * Lưu các khuôn đã gặp theo từng máy
         */
        Map<String, Set<String>> machineMolds = new LinkedHashMap<>();

        for (int i = START_ROW; i <= planSheet.getLastRowNum(); i++) {

            Row row = planSheet.getRow(i);
            if (row == null) {
                continue;
            }

            String machineCode = normalizeMachineCode(
                    ReportExcelHelper.getString(row, ctx, "A"));

            if (machineCode.isBlank()) {
                continue;
            }

            String moldCode = ReportExcelHelper
                    .getString(row, ctx, "E")
                    .trim();

            Double startHour = ReportExcelHelper.getDouble(row, ctx, "BI");
            Double endHour = ReportExcelHelper.getDouble(row, ctx, "BJ");

            /*
             * Không có giờ thì bỏ
             */
            if (startHour == null || endHour == null) {
                continue;
            }

            /*
             * Khuôn trùng -> bỏ qua
             */
            Set<String> molds = machineMolds.computeIfAbsent(
                    machineCode,
                    k -> new HashSet<>());

            if (!moldCode.isBlank() && !molds.add(moldCode)) {
                continue;
            }

            String phase = ReportExcelHelper.getString(row, ctx, "B");

            machineMap
                    .computeIfAbsent(
                            machineCode,
                            k -> new java.util.ArrayList<>())
                    .add(new MachineSession(
                            phase,
                            startHour,
                            endHour));
        }

        int reportRowIndex = 1;

        for (Map.Entry<String, List<MachineSession>> entry : machineMap.entrySet()) {

            String machineCode = entry.getKey();
            List<MachineSession> sessions = entry.getValue();

            if (sessions.isEmpty()) {
                continue;
            }

            /*
             * Sắp xếp theo công đoạn
             */
            sessions.sort(
                    java.util.Comparator.comparingDouble(
                            s -> {
                                try {
                                    return Double.parseDouble(
                                            s.getPhase().replace(",", "."));
                                } catch (Exception e) {
                                    return Double.MAX_VALUE;
                                }
                            }));

            List<TimeRange> downtimeRanges = new java.util.ArrayList<>();

            /*
             * Khoảng đầu tiên
             */
            MachineSession firstSession = sessions.get(0);

            if (!isHourEquals(
                    firstSession.getStartHour(),
                    8d)) {

                downtimeRanges.add(
                        new TimeRange(
                                8d,
                                firstSession.getStartHour()));
            }

            /*
             * Khoảng giữa các phiên
             */
            for (int i = 0; i < sessions.size() - 1; i++) {

                MachineSession current = sessions.get(i);
                MachineSession next = sessions.get(i + 1);

                if (!isHourEquals(
                        current.getEndHour(),
                        next.getStartHour())) {

                    downtimeRanges.add(
                            new TimeRange(
                                    current.getEndHour(),
                                    next.getStartHour()));
                }
            }

            /*
             * Khoảng cuối
             */
            MachineSession lastSession = sessions.get(sessions.size() - 1);

            if (!isHourEquals(
                    lastSession.getEndHour(),
                    8d)) {

                downtimeRanges.add(
                        new TimeRange(
                                lastSession.getEndHour(),
                                8d));
            }

            /*
             * Merge:
             * 8-0 + 0-10 => 8-10
             */
            List<TimeRange> mergedRanges = new java.util.ArrayList<>();

            for (TimeRange current : downtimeRanges) {

                if (mergedRanges.isEmpty()) {

                    mergedRanges.add(
                            new TimeRange(
                                    current.getStart(),
                                    current.getEnd()));
                    continue;
                }

                TimeRange last = mergedRanges.get(
                        mergedRanges.size() - 1);

                if (isHourEquals(
                        last.getEnd(),
                        current.getStart())) {

                    last.setEnd(current.getEnd());

                } else {

                    mergedRanges.add(
                            new TimeRange(
                                    current.getStart(),
                                    current.getEnd()));
                }
            }

            if (mergedRanges.isEmpty()) {
                continue;
            }

            /*
             * Tính tổng phút dừng
             */
            double totalDowntimeMinutes = 0;

            for (TimeRange range : mergedRanges) {

                double start = range.getStart();
                double end = range.getEnd();

                double hours;

                if (end >= start) {

                    hours = end - start;

                } else {

                    hours = (24 - start) + end;
                }

                totalDowntimeMinutes += hours * 60;
            }

            String downtimeText = mergedRanges.stream()
                    .map(r -> formatHour(r.getStart())
                            + " - "
                            + formatHour(r.getEnd()))
                    .collect(
                            java.util.stream.Collectors.joining("; "));

            Row reportRow = reportSheet.createRow(reportRowIndex++);

            reportRow.createCell(0).setCellValue(machineCode);
            reportRow.createCell(1).setCellValue(downtimeText);
            reportRow.createCell(2).setCellValue(totalDowntimeMinutes);
        }

        reportSheet.autoSizeColumn(0);
        reportSheet.autoSizeColumn(1);
        reportSheet.autoSizeColumn(2);
    }

    private boolean isHourEquals(Double a, Double b) {

        if (a == null || b == null) {
            return false;
        }

        return Math.abs(a - b) < 0.0001;
    }

    private String formatHour(Double value) {

        if (value == null) {
            return "";
        }

        if (value % 1 == 0) {
            return String.valueOf(value.intValue());
        }

        return String.valueOf(value);
    }
}
