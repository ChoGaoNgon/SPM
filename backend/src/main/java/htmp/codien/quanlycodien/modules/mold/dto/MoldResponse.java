package htmp.codien.quanlycodien.modules.mold.dto;

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
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MoldResponse {
    Long id;
    String code;
    String type;
    String factory;
    LocalDate expectedStartDate;
    LocalDate expectedEndDate;
    Boolean isTransfer;
    Integer numRepair;
}
