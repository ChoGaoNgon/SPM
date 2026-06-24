package htmp.codien.quanlycodien.modules.newmodel.product.service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Pattern;

import htmp.codien.quanlycodien.modules.newmodel.product.entity.Product;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.dto.productEventRequirement.ProductEventRequirementRequest;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.entity.ProductEventRequirement;

final class ProductEventRequirementSupport {

    private static final Pattern EVENT_NAME_PATTERN = Pattern.compile("^EVENT\\s+\\d+$");

    private ProductEventRequirementSupport() {
    }

    static List<ProductEventRequirement> buildValidatedEventRequirements(Product product,
            List<ProductEventRequirementRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return Collections.emptyList();
        }

        List<ProductEventRequirement> eventRequirements = new ArrayList<>();
        LocalDate previousDeliveryDate = null;

        for (int index = 0; index < requests.size(); index++) {
            ProductEventRequirementRequest request = requests.get(index);
            String expectedName = buildExpectedEventName(index);

            validateEventName(request != null ? request.getName() : null, expectedName);

            LocalDate deliveryDate = parseRequiredEventDeliveryDate(
                    request != null ? request.getDeliveryDate() : null,
                    expectedName);

            if (previousDeliveryDate != null && !deliveryDate.isAfter(previousDeliveryDate)) {
                throw new IllegalArgumentException(
                        expectedName + " phải có thời gian sau " + buildExpectedEventName(index - 1));
            }

            eventRequirements.add(ProductEventRequirement.builder()
                    .product(product)
                    .name(expectedName)
                    .deliveryDate(deliveryDate)
                    .quantity(request != null ? request.getQuantity() : null)
                    .build());

            previousDeliveryDate = deliveryDate;
        }

        return eventRequirements;
    }

    static String buildExpectedEventName(int index) {
        return "EVENT " + (index + 1);
    }

    private static void validateEventName(String actualName, String expectedName) {
        if (actualName == null || actualName.isBlank()) {
            throw new IllegalArgumentException("Tên event là bắt buộc và phải theo định dạng " + expectedName);
        }

        String normalizedName = actualName.trim();
        if (!EVENT_NAME_PATTERN.matcher(normalizedName).matches()) {
            throw new IllegalArgumentException("Tên event phải đúng định dạng EVENT [số thứ tự], ví dụ: EVENT 1");
        }

        if (!expectedName.equals(normalizedName)) {
            throw new IllegalArgumentException("Event tại vị trí hiện tại phải có tên là " + expectedName);
        }
    }

    private static LocalDate parseRequiredEventDeliveryDate(String deliveryDate, String eventName) {
        if (deliveryDate == null || deliveryDate.isBlank()) {
            throw new IllegalArgumentException(eventName + " phải có ngày giao hàng");
        }

        try {
            return LocalDate.parse(deliveryDate.trim());
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException(eventName + " phải có ngày giao hàng đúng định dạng yyyy-MM-dd");
        }
    }
}