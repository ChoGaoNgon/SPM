package htmp.codien.quanlycodien.modules.newmodel.mapping.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.common.exception.BadRequestException;
import htmp.codien.quanlycodien.common.util.ExcelUtils;
import htmp.codien.quanlycodien.modules.newmodel.mapping.entity.ProductCodeMapping;
import htmp.codien.quanlycodien.modules.newmodel.mapping.repository.ProductCodeMappingRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductCodeMappingServiceImpl implements ProductCodeMappingService {

    private final ProductCodeMappingRepository productCodeMappingRepository;

    @Override
    @Transactional
    public int importFromExcel(MultipartFile file) {

        validateFile(file);

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {

            Sheet sheet = workbook.getSheetAt(0);

            if (sheet == null) {
                throw new BadRequestException("File Excel không có sheet dữ liệu");
            }

            List<ProductCodeMapping> importList = new ArrayList<>();
            Set<String> mesCodes = new HashSet<>();

            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {

                Row row = sheet.getRow(rowIndex);

                if (row == null || isEmptyRow(row)) {
                    continue;
                }

                String mesProductCode = normalizeCellValue(ExcelUtils.getCellString(row, 0));

                String khsxProductCode = normalizeCellValue(ExcelUtils.getCellString(row, 1));

                if (mesProductCode.isEmpty()
                        || khsxProductCode.isEmpty()) {

                    throw new BadRequestException(
                            "Dòng " + (rowIndex + 1)
                                    + " thiếu mã sản phẩm");
                }

                ProductCodeMapping item = new ProductCodeMapping();

                item.setMesProductCode(mesProductCode);
                item.setKhsxProductCode(khsxProductCode);

                importList.add(item);
                mesCodes.add(mesProductCode);
            }

            Map<String, ProductCodeMapping> existingMap = productCodeMappingRepository
                    .findAllByMesProductCodeIn(mesCodes)
                    .stream()
                    .collect(Collectors.toMap(
                            ProductCodeMapping::getMesProductCode,
                            x -> x));

            List<ProductCodeMapping> saveList = new ArrayList<>();

            for (ProductCodeMapping item : importList) {

                ProductCodeMapping existing = existingMap.get(item.getMesProductCode());

                if (existing != null) {

                    existing.setKhsxProductCode(
                            item.getKhsxProductCode());

                    saveList.add(existing);

                } else {

                    saveList.add(item);
                }
            }

            productCodeMappingRepository.saveAll(saveList);

            return saveList.size();

        } catch (IOException ex) {

            throw new BadRequestException(
                    "Không thể đọc file Excel");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File import không được để trống");
        }
    }

    private boolean isEmptyRow(Row row) {
        String mesProductCode = normalizeCellValue(ExcelUtils.getCellString(row, 0));
        String khsxProductCode = normalizeCellValue(ExcelUtils.getCellString(row, 1));
        return mesProductCode.isEmpty() && khsxProductCode.isEmpty();
    }

    private String normalizeCellValue(String value) {
        if (value == null) {
            return "";
        }

        String normalized = value.trim();
        if (normalized.endsWith(".0")) {
            return normalized.substring(0, normalized.length() - 2);
        }

        return normalized;
    }
}