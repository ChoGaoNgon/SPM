package htmp.codien.quanlycodien.modules.report.oeeReport.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

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

public class MachineOperationReportDTO {

    Integer stt;

    String id_oi;
    String mes_scheduling_code;
    String production_order;

    String product_code;
    String product_name;

    String step_code;
    String machine_code;

    LocalDate create_date;
    LocalTime create_time;

    LocalDate end_date;
    LocalTime end_time;

    BigDecimal time_working;
    BigDecimal time_start;
    BigDecimal time_real;

    BigDecimal quantity;
    BigDecimal in_process;
    BigDecimal sl_dong_goi;

    BigDecimal complete;
    BigDecimal ng;

    BigDecimal tong_ng_linh_kien;
    BigDecimal skip_shot;
    BigDecimal sl_chenh_lech;
    BigDecimal sl_them;

    BigDecimal hoan_thanh;
    BigDecimal ty_le_ng;

    String so_ct_pnd;
    String ma_khuon;

    BigDecimal chu_ky_ke_hoach;
    BigDecimal chu_ky_setup;
    BigDecimal chu_ky_thuc_te;

    BigDecimal cavity_ho_so_khuon;
    BigDecimal cavity_san_xuat;

    String line_group_code1;
    String line_group_code2;
    String line_group_code3;

    String thu_khuon_yn;
}