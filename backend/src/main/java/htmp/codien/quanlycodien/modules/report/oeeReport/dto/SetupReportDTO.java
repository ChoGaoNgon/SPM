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

public class SetupReportDTO {

    Integer stt;

    String ma_day_chuyen;

    String ma_sp;
    String ten_sp;

    BigDecimal chu_ky_tt;

    BigDecimal number_shot;

    String ma_nv_th;
    String ten_nv_th;

    LocalDate ngay_bd_setup;
    LocalTime tg_bd_setup;

    LocalDate ngay_kt_setup;
    LocalTime tg_kt_setup;

    BigDecimal tg_setup;

    BigDecimal tg_phatsinh;

    String ma_loi;
    String ten_loi;

    LocalDate ngay_bd_ghiloi;
    LocalTime tg_bd_ghiloi;

    LocalDate ngay_kt_ghiloi;
    LocalTime tg_kt_ghiloi;

    BigDecimal tg_xl;

    String ma_nv_xu_ly;
    String ten_nv_xu_ly;

    String pa_xu_ly;

    String ghi_chu_error;
}