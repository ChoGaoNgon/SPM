package htmp.codien.quanlycodien.modules.newmodel.product.service;

import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductHistoryResponse;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductHistoryServiceImpl implements ProductHistoryService {

    private final ProductHistoryRepository productHistoryRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public List<ProductHistoryResponse> getProductHistoryByFieldName(Long productId, String fieldName) {
        return productHistoryRepository
                .findByProduct_IdAndFieldNameOrderByCreatedAtDesc(productId, fieldName)
                .stream()
                .map(h -> {
                    String changerName = h.getCreatedBy() != null
                            ? employeeRepository.findByCode(h.getCreatedBy())
                                    .map(e -> e.getName())
                                    .orElse(h.getCreatedBy())
                            : null;
                    return ProductHistoryResponse.builder()
                            .fieldName(h.getFieldName())
                            .oldValue(h.getOldValue())
                            .newValue(h.getNewValue())
                            .createdAt(h.getCreatedAt())
                            .createdByCode(h.getCreatedBy())
                            .createdByName(changerName)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
