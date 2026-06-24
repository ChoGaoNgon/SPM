package htmp.codien.quanlycodien.modules.report.oeeReport.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KhsxItemDTO {
    String may;

    @JsonProperty("ma_sp")
    String maSp;

    @JsonProperty("chu_ky")
    Double chuKy;

    @JsonProperty("sl_trong_ngay")
    Integer slTrongNgay;
}
