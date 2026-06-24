package htmp.codien.quanlycodien.modules.newmodel.mapping.service;

import org.springframework.web.multipart.MultipartFile;

public interface ProductCodeMappingService {
    int importFromExcel(MultipartFile file);
}