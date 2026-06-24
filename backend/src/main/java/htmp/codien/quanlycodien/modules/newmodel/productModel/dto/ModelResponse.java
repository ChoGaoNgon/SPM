package htmp.codien.quanlycodien.modules.newmodel.productModel.dto;

import java.time.LocalDate;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PACKAGE)
public class ModelResponse {
    Long id;
    String code;
    String customerId;
    String customerName;
    LocalDate orderedDate;
}
