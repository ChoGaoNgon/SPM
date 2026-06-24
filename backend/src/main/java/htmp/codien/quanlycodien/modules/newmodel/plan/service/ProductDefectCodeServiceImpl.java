package htmp.codien.quanlycodien.modules.newmodel.plan.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productDefectCode.ProductDefectCodeDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductDefectCode;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductDefectCodeRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductDefectCodeServiceImpl implements ProductDefectCodeService {

    private final ProductDefectCodeRepository repository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public String syncDefects() {
        try {
            String url = "http://apps.htmp.vn:8000/api/resource/Loi QC?limit=1000&fields=[\"ma_loi\",\"ten_loi\"]";

            String json = restTemplate.getForObject(url, String.class);

            JsonNode root = objectMapper.readTree(json);
            JsonNode data = root.path("data");

            if (!data.isArray()) {
                return "Không có dữ liệu để đồng bộ";
            }

            int insertOrUpdateCount = 0;

            for (JsonNode node : data) {
                String code = node.path("ma_loi").asText(null);
                String description = node.path("ten_loi").asText(null);

                if (code == null || code.isBlank())
                    continue;

                ProductDefectCode entity = repository
                        .findByCode(code)
                        .orElseGet(ProductDefectCode::new);

                entity.setCode(code);
                entity.setDescription(description);

                repository.save(entity);
                insertOrUpdateCount++;
            }

            return "Đồng bộ thành công " + insertOrUpdateCount + " mã lỗi QC";

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi đồng bộ mã lỗi QC", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDefectCodeDTO> getAll() {
        return repository.findAll(Sort.by("code")).stream()
                .map(entity -> ProductDefectCodeDTO.builder()
                        .id(entity.getId())
                        .code(entity.getCode())
                        .description(entity.getDescription())
                        .build())
                .toList();
    }
}
