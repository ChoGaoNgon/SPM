package htmp.codien.quanlycodien.modules.newmodel.product.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {
    Long id;
    String code;
    String modelCode;
    Long modelId;
    String name;
    String moldCode;
    String productCategory;
    String gateType;
    String image;
    String nmdInfoStatus;
    LocalDate infoReceivedDate;
    LocalDateTime createdAt;
}