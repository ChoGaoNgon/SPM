package htmp.codien.quanlycodien.modules.newmodel.product.helper;

import htmp.codien.quanlycodien.modules.newmodel.product.entity.Product;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductHistory;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductHistoryRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class ProductAuditLogHelper {
    private final ProductHistoryRepository historyRepository;
    private final ProductRepository productRepository;

    public void logIfChanged(Long productId, String fieldName, Object oldVal, Object newVal) {
        String oldNormalized = normalize(oldVal);
        String newNormalized = normalize(newVal);

        if (!Objects.equals(oldNormalized, newNormalized)) {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: " + productId));

            ProductHistory history = ProductHistory.builder()
                    .product(product)
                    .fieldName(fieldName)
                    .oldValue(oldNormalized != null ? oldNormalized : "Trống")
                    .newValue(newNormalized != null ? newNormalized : "Trống")
                    .build();
            historyRepository.save(history);
        }
    }

    private String normalize(Object val) {
        if (val == null) return null;
        String str = val.toString().trim();
        try {
            return new BigDecimal(str).stripTrailingZeros().toPlainString();
        } catch (NumberFormatException e) {
            return str;
        }
    }
}
