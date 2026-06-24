package htmp.codien.quanlycodien.modules.report.oeeReport.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

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

public class NgReportDTO {

    Integer stt;
    String line_code;
    String id_oi;
    String mes_scheduling_code;
    LocalDate create_date;
    LocalTime create_time;
    LocalDate end_date;
    LocalTime end_time;
    String product_code;
    String ten_vt;
    String step_name;
    BigDecimal ng_qty;

    String ma_loi;
    String ten_loi;
    String nh_loi1;

    String ma_nv;
    String ten_nv;

    LocalDate ngay_dk_ng;
    LocalTime gio_dk_ng;

    String nh_vt6;
    String ten_kh;
    String nh_kh1;
}