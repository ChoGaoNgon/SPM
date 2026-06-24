package htmp.codien.quanlycodien.infrastructure.excel;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ExcelImportService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public JsonNode loadConfig(String configName) {
        try {
            ClassPathResource resource = new ClassPathResource("excel-config/" + configName + ".json");

            try (InputStream is = resource.getInputStream()) {
                return objectMapper.readTree(is);
            }

        } catch (Exception e) {
            throw new RuntimeException("Cannot load excel config: " + configName, e);
        }
    }

    public List<Map<String, Object>> parseExcel(Sheet sheet, JsonNode config) {

        List<Map<String, Object>> result = new ArrayList<>();

        int technicalHeaderRowIndex = config.get("technicalHeaderRow").asInt();
        int startRowIndex = config.get("startRow").asInt();

        Row technicalHeaderRow = sheet.getRow(technicalHeaderRowIndex);

        Map<Integer, String> columnIndexToKey = new HashMap<>();

        JsonNode columns = config.get("columns");

        for (int i = 0; i < technicalHeaderRow.getLastCellNum(); i++) {

            Cell cell = technicalHeaderRow.getCell(i);
            if (cell == null)
                continue;

            String technicalHeaderValue = cell.toString().trim();

            for (JsonNode col : columns) {
                for (JsonNode h : col.get("technicalHeaders")) {
                    if (technicalHeaderValue.contains(h.asText().split("\n")[0])) {
                        columnIndexToKey.put(i, col.get("key").asText());
                    }
                }
            }
        }

        for (int i = startRowIndex; i <= sheet.getLastRowNum(); i++) {

            Row row = sheet.getRow(i);
            if (row == null)
                continue;

            Map<String, Object> rowData = new HashMap<>();
            boolean hasAnyData = false;

            for (int j = 0; j < row.getLastCellNum(); j++) {

                if (!columnIndexToKey.containsKey(j))
                    continue;

                String key = columnIndexToKey.get(j);
                Cell cell = row.getCell(j);

                Object value = getCellValue(cell);
                if (value != null && !value.toString().trim().isEmpty()) {
                    hasAnyData = true;
                }

                putNestedValue(rowData, key, value);
            }

            if (hasAnyData) {
                result.add(rowData);
            }
        }

        return result;
    }

    private Object getCellValue(Cell cell) {
        if (cell == null)
            return null;

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue();
                }
                return cell.getNumericCellValue();
            case BOOLEAN:
                return cell.getBooleanCellValue();
            case FORMULA:
                return cell.getCellFormula();
            default:
                return null;
        }
    }

    private void putNestedValue(Map<String, Object> root, String key, Object value) {

        String[] parts = key.split("\\.");

        Map<String, Object> current = root;

        for (int i = 0; i < parts.length - 1; i++) {

            String part = parts[i];

            if (!current.containsKey(part) || !(current.get(part) instanceof Map)) {
                current.put(part, new HashMap<String, Object>());
            }

            current = (Map<String, Object>) current.get(part);
        }

        current.put(parts[parts.length - 1], value);
    }
}