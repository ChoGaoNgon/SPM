package htmp.codien.quanlycodien.modules.order.dto;

import java.time.LocalDate;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class OrderItemDTO {
    Long id;
    String materialCode;
    String materialName;
    String unit;
    Double quantityOrdered;
    Double quantityReceived;
    LocalDate receivedDate;
    String purpose;
    String note;
}
