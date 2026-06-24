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

public class ProductionIssueReportDTO {

    Integer stt;

    String id_oi;

    LocalDate ngay_ct;

    String so_ct;

    String ma_vt;
    String ten_vt;

    String ma_day_chuyen;

    String ma_khuon;

    LocalDate ngay_bd_sanxuat;
    LocalTime tg_bd_sanxuat;

    LocalDate ngay_kt_sanxuat;
    LocalTime tg_kt_sanxuat;

    BigDecimal tg_sanxuat;

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
}