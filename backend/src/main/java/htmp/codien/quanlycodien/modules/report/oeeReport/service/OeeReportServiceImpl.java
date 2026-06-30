package htmp.codien.quanlycodien.modules.report.oeeReport.service;

import java.io.InputStream;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Time;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import htmp.codien.quanlycodien.modules.newmodel.mapping.entity.ProductCodeMapping;
import htmp.codien.quanlycodien.modules.newmodel.mapping.repository.ProductCodeMappingRepository;
import htmp.codien.quanlycodien.modules.report.oeeReport.dto.KhsxItemDTO;
import htmp.codien.quanlycodien.modules.report.oeeReport.dto.MachineOperationReportDTO;
import htmp.codien.quanlycodien.modules.report.oeeReport.dto.MoldChangeReportDTO;
import htmp.codien.quanlycodien.modules.report.oeeReport.dto.NgReportDTO;
import htmp.codien.quanlycodien.modules.report.oeeReport.dto.OeeReportFilterRequest;
import htmp.codien.quanlycodien.modules.report.oeeReport.dto.ProductionIssueReportDTO;
import htmp.codien.quanlycodien.modules.report.oeeReport.dto.SetupReportDTO;
import jakarta.annotation.PreDestroy;

@Repository
@ConditionalOnBean(name = "tertiaryJdbcTemplate")
public class OeeReportServiceImpl implements OeeReportService {

        private static final Logger log = LoggerFactory.getLogger(OeeReportServiceImpl.class);

        private static final String DEFAULT_USER_ID = "1";
        private static final String DEFAULT_TEMPLATE_CODE = "001";
        private static final String DEFAULT_CULTURE = "vi-VN";
        private static final String DEFAULT_MACHINE_PREFIX = "DUC";
        private static final String DEFAULT_COMPANY_CODE = "001";
        private static final int DEFAULT_LIMIT = 100000;
        private static final int DEFAULT_DANG_KY_NG_LIMIT = 10000;
        private static final int DEFAULT_THAY_KHUON_LIMIT = 10000;
        private static final int DEFAULT_SETUP_LIMIT = 10000;
        private static final int DEFAULT_PHAT_SINH_LIMIT = 10000;
        private static final int DEFAULT_OFFSET = 0;
        private static final int POI_BYTE_ARRAY_MAX_OVERRIDE = 200_000_000;

        private static final String GRID_MESBCKQVHPLV = "MESBCKQVHPLV";
        private static final String GRID_MESBK_DANG_KY_NG = "MESBKDangKyNG2";
        private static final String GRID_MESBK_THAY_KHUON = "MESBKThayKhuon";
        private static final String GRID_MESBK_SETUP = "MESBKSetup";
        private static final String GRID_MESBK_PHAT_SINH = "MESBKPhatSinh";

        private static final String H_740 = "07:40:00";
        private static final String H_800 = "08:00:00";
        private static final String H_810 = "08:10:00";
        private static final String SETUP_JSON_H000 = "00:00";
        private static final String SETUP_JSON_H740 = "07:40";
        private static final String SETUP_JSON_H800 = "08:00";
        private static final String SETUP_JSON_H2300 = "23:00";
        private static final String ERROR_CODE_B1 = "B1";
        private static final String ERROR_CODE_B2 = "B2";
        private static final int REPORT_FETCH_PARALLELISM = Math.max(4, Runtime.getRuntime().availableProcessors());
        private static final WeekFields WEEK_FIELDS = WeekFields.of(Locale.getDefault());

        private final RestTemplate restTemplate;

        private final ObjectMapper objectMapper;

        private final ProductCodeMappingRepository productCodeMappingRepository;

        @Value("${api.khsx.url}")
        private String khsxApiUrl;

        private final JdbcTemplate tertiaryJdbcTemplate;
        private final ExecutorService reportFetchExecutor = Executors.newFixedThreadPool(REPORT_FETCH_PARALLELISM);
        private final OeeDungMaySheetWriter dungMaySheetWriter = new OeeDungMaySheetWriter();
        private final OeeNhapNgSheetWriter nhapNgSheetWriter = new OeeNhapNgSheetWriter();
        private final OeeKqsxSheetWriter kqsxSheetWriter = new OeeKqsxSheetWriter();

        private final RowMapper<MachineOperationReportDTO> machineOperationRowMapper = (rs,
                        rowNum) -> MachineOperationReportDTO
                                        .builder()
                                        .stt(rs.getInt("stt"))
                                        .id_oi(rs.getString("id_oi"))
                                        .mes_scheduling_code(rs.getString("mes_scheduling_code"))
                                        .production_order(rs.getString("production_order"))
                                        .product_code(rs.getString("product_code"))
                                        .product_name(rs.getString("product_name"))
                                        .step_code(rs.getString("step_code"))
                                        .machine_code(rs.getString("machine_code"))
                                        .create_date(toLocalDate(rs.getDate("create_date")))
                                        .create_time(toLocalTime(rs.getTime("create_time")))
                                        .end_date(toLocalDate(rs.getDate("end_date")))
                                        .end_time(toLocalTime(rs.getTime("end_time")))
                                        .time_working(rs.getBigDecimal("time_working"))
                                        .time_start(rs.getBigDecimal("time_start"))
                                        .time_real(rs.getBigDecimal("time_real"))
                                        .quantity(rs.getBigDecimal("quantity"))
                                        .in_process(rs.getBigDecimal("in_process"))
                                        .sl_dong_goi(rs.getBigDecimal("sl_dong_goi"))
                                        .complete(rs.getBigDecimal("complete"))
                                        .ng(rs.getBigDecimal("ng"))
                                        .tong_ng_linh_kien(rs.getBigDecimal("tong_ng_linh_kien"))
                                        .skip_shot(rs.getBigDecimal("skip_shot"))
                                        .sl_chenh_lech(rs.getBigDecimal("sl_chenh_lech"))
                                        .sl_them(rs.getBigDecimal("sl_them"))
                                        .hoan_thanh(rs.getBigDecimal("hoan_thanh"))
                                        .ty_le_ng(rs.getBigDecimal("ty_le_ng"))
                                        .so_ct_pnd(rs.getString("so_ct_pnd"))
                                        .ma_khuon(rs.getString("ma_khuon"))
                                        .chu_ky_ke_hoach(rs.getBigDecimal("chu_ky_ke_hoach"))
                                        .chu_ky_setup(rs.getBigDecimal("chu_ky_setup"))
                                        .chu_ky_thuc_te(rs.getBigDecimal("chu_ky_thuc_te"))
                                        .cavity_ho_so_khuon(rs.getBigDecimal("cavity_ho_so_khuon"))
                                        .cavity_san_xuat(rs.getBigDecimal("cavity_san_xuat"))
                                        .line_group_code1(rs.getString("line_group_code1"))
                                        .line_group_code2(rs.getString("line_group_code2"))
                                        .line_group_code3(rs.getString("line_group_code3"))
                                        .thu_khuon_yn(rs.getString("thu_khuon_yn"))
                                        .build();

        private final RowMapper<NgReportDTO> ngReportRowMapper = (rs, rowNum) -> NgReportDTO.builder()
                        .stt(rs.getInt("stt"))
                        .line_code(rs.getString("line_code"))
                        .id_oi(rs.getString("id_oi"))
                        .mes_scheduling_code(rs.getString("mes_scheduling_code"))
                        .create_date(toLocalDate(rs.getDate("create_date")))
                        .create_time(toLocalTime(rs.getTime("create_time")))
                        .end_date(toLocalDate(rs.getDate("end_date")))
                        .end_time(toLocalTime(rs.getTime("end_time")))
                        .product_code(rs.getString("product_code"))
                        .ten_vt(rs.getString("ten_vt"))
                        .step_name(rs.getString("step_name"))
                        .ng_qty(rs.getBigDecimal("ng_qty"))
                        .ma_loi(rs.getString("ma_loi"))
                        .ten_loi(rs.getString("ten_loi"))
                        .nh_loi1(rs.getString("nh_loi1"))
                        .ma_nv(rs.getString("ma_nv"))
                        .ten_nv(rs.getString("ten_nv"))
                        .ngay_dk_ng(toLocalDate(rs.getDate("ngay_dk_ng")))
                        .gio_dk_ng(toLocalTime(rs.getTime("gio_dk_ng")))
                        .nh_vt6(rs.getString("nh_vt6"))
                        .ten_kh(rs.getString("ten_kh"))
                        .nh_kh1(rs.getString("nh_kh1"))
                        .build();

        private final RowMapper<MoldChangeReportDTO> moldChangeRowMapper = (rs, rowNum) -> MoldChangeReportDTO.builder()
                        .stt(rs.getInt("stt"))
                        .so_ct(rs.getString("so_ct"))
                        .ngay_ct(toLocalDate(rs.getDate("ngay_ct")))
                        .so_wo(rs.getString("so_wo"))
                        .ma_vt(rs.getString("ma_vt"))
                        .ten_vt(rs.getString("ten_vt"))
                        .ma_day_chuyen(rs.getString("ma_day_chuyen"))
                        .ma_khuon_len(rs.getString("ma_khuon_len"))
                        .ma_khuon_xuong(rs.getString("ma_khuon_xuong"))
                        .ma_nv_th(rs.getString("ma_nv_th"))
                        .ten_nv_th(rs.getString("ten_nv_th"))
                        .ngay_bd_lenkhuon(toLocalDate(rs.getDate("ngay_bd_lenkhuon")))
                        .tg_bd_lenkhuon(toLocalTime(rs.getTime("tg_bd_lenkhuon")))
                        .ngay_kt(toLocalDate(rs.getDate("ngay_kt")))
                        .tg_kt_lenkhuon(toLocalTime(rs.getTime("tg_kt_lenkhuon")))
                        .tg_lenkhuon(readAsBigDecimal(rs, "tg_lenkhuon"))
                        .tg_phatsinh(readAsBigDecimal(rs, "tg_phatsinh"))
                        .ma_loi(rs.getString("ma_loi"))
                        .ten_loi(rs.getString("ten_loi"))
                        .ngay_bd_ghiloi(toLocalDate(rs.getDate("ngay_bd_ghiloi")))
                        .tg_bd_ghiloi(toLocalTime(rs.getTime("tg_bd_ghiloi")))
                        .ngay_kt_ghiloi(toLocalDate(rs.getDate("ngay_kt_ghiloi")))
                        .tg_kt_ghiloi(toLocalTime(rs.getTime("tg_kt_ghiloi")))
                        .tg_xl(readAsBigDecimal(rs, "tg_xl"))
                        .ma_nv_xu_ly(rs.getString("ma_nv_xu_ly"))
                        .ten_nv_xu_ly(rs.getString("ten_nv_xu_ly"))
                        .pa_xu_ly(rs.getString("pa_xu_ly"))
                        .ghi_chu_error(rs.getString("ghi_chu_error"))
                        .trang_thai(rs.getString("trang_thai"))
                        .build();

        private final RowMapper<SetupReportDTO> setupRowMapper = (rs, rowNum) -> SetupReportDTO.builder()
                        .stt(rs.getInt("stt"))
                        .ma_day_chuyen(rs.getString("ma_day_chuyen"))
                        .ma_sp(rs.getString("ma_sp"))
                        .ten_sp(rs.getString("ten_sp"))
                        .chu_ky_tt(rs.getBigDecimal("chu_ky_tt"))
                        .number_shot(rs.getBigDecimal("number_shot"))
                        .ma_nv_th(rs.getString("ma_nv_th"))
                        .ten_nv_th(rs.getString("ten_nv_th"))
                        .ngay_bd_setup(toLocalDate(rs.getDate("ngay_bd_setup")))
                        .tg_bd_setup(toLocalTime(rs.getTime("tg_bd_setup")))
                        .ngay_kt_setup(toLocalDate(rs.getDate("ngay_kt_setup")))
                        .tg_kt_setup(toLocalTime(rs.getTime("tg_kt_setup")))
                        .tg_setup(readAsBigDecimal(rs, "tg_setup"))
                        .tg_phatsinh(readAsBigDecimal(rs, "tg_phatsinh"))
                        .ma_loi(rs.getString("ma_loi"))
                        .ten_loi(rs.getString("ten_loi"))
                        .ngay_bd_ghiloi(toLocalDate(rs.getDate("ngay_bd_ghiloi")))
                        .tg_bd_ghiloi(toLocalTime(rs.getTime("tg_bd_ghiloi")))
                        .ngay_kt_ghiloi(toLocalDate(rs.getDate("ngay_kt_ghiloi")))
                        .tg_kt_ghiloi(toLocalTime(rs.getTime("tg_kt_ghiloi")))
                        .tg_xl(readAsBigDecimal(rs, "tg_xl"))
                        .ma_nv_xu_ly(rs.getString("ma_nv_xu_ly"))
                        .ten_nv_xu_ly(rs.getString("ten_nv_xu_ly"))
                        .pa_xu_ly(rs.getString("pa_xu_ly"))
                        .ghi_chu_error(rs.getString("ghi_chu_error"))
                        .build();

        private final RowMapper<ProductionIssueReportDTO> productionIssueRowMapper = (rs,
                        rowNum) -> ProductionIssueReportDTO
                                        .builder()
                                        .stt(rs.getInt("stt"))
                                        .id_oi(rs.getString("id_oi"))
                                        .ngay_ct(toLocalDate(rs.getDate("ngay_ct")))
                                        .so_ct(rs.getString("so_ct"))
                                        .ma_vt(rs.getString("ma_vt"))
                                        .ten_vt(rs.getString("ten_vt"))
                                        .ma_day_chuyen(rs.getString("ma_day_chuyen"))
                                        .ma_khuon(rs.getString("ma_khuon"))
                                        .ngay_bd_sanxuat(toLocalDate(rs.getDate("ngay_bd_sanxuat")))
                                        .tg_bd_sanxuat(toLocalTime(rs.getTime("tg_bd_sanxuat")))
                                        .ngay_kt_sanxuat(toLocalDate(rs.getDate("ngay_kt_sanxuat")))
                                        .tg_kt_sanxuat(toLocalTime(rs.getTime("tg_kt_sanxuat")))
                                        .tg_sanxuat(readAsBigDecimal(rs, "tg_sanxuat"))
                                        .tg_phatsinh(readAsBigDecimal(rs, "tg_phatsinh"))
                                        .ma_loi(rs.getString("ma_loi"))
                                        .ten_loi(rs.getString("ten_loi"))
                                        .ngay_bd_ghiloi(toLocalDate(rs.getDate("ngay_bd_ghiloi")))
                                        .tg_bd_ghiloi(toLocalTime(rs.getTime("tg_bd_ghiloi")))
                                        .ngay_kt_ghiloi(toLocalDate(rs.getDate("ngay_kt_ghiloi")))
                                        .tg_kt_ghiloi(toLocalTime(rs.getTime("tg_kt_ghiloi")))
                                        .tg_xl(readAsBigDecimal(rs, "tg_xl"))
                                        .ma_nv_xu_ly(rs.getString("ma_nv_xu_ly"))
                                        .ten_nv_xu_ly(rs.getString("ten_nv_xu_ly"))
                                        .build();

        public OeeReportServiceImpl(
                        RestTemplate restTemplate,
                        ObjectMapper objectMapper,
                        ProductCodeMappingRepository productCodeMappingRepository,
                        @Qualifier("tertiaryJdbcTemplate") JdbcTemplate tertiaryJdbcTemplate) {
                this.restTemplate = restTemplate;
                this.objectMapper = objectMapper;
                this.productCodeMappingRepository = productCodeMappingRepository;
                this.tertiaryJdbcTemplate = tertiaryJdbcTemplate;
        }

        private String buildMesBckQvHplvJson(OeeReportFilterRequest request) {

                return """
                                {
                                        "JSON": {
                                                "user_id": "%s",
                                                "searchDynamic": {
                                                        "dfrom": "%s",
                                                        "dto": "%s",
                                                        "time_from": "%s",
                                                        "time_to": "%s",
                                                        "cma_cong_doan": "",
                                                        "cword_order": "",
                                                        "cma_vt": "",
                                                        "production_order": "",
                                                        "cmachine_code": "",
                                                        "cnh_vt6": "",                                                                                                                                                   "branch_code": "%s",
                                                        "mau_bc": "%s",
                                                        "gridid": "%s",
                                                        "index": 0,
                                                        "limit": %d,
                                                        "culture": "%s"
                                                }
                                        }
                                }
                                """
                                .formatted(
                                                DEFAULT_USER_ID,
                                                request.getDfrom(),
                                                request.getDto(),
                                                request.getTimeFrom(),
                                                request.getTimeTo(),
                                                DEFAULT_TEMPLATE_CODE,
                                                DEFAULT_TEMPLATE_CODE,
                                                GRID_MESBCKQVHPLV,
                                                resolveLimit(request, DEFAULT_LIMIT),
                                                DEFAULT_CULTURE);
        }

        private String buildDangKyNgJson(OeeReportFilterRequest request) {
                return """
                                {
                                        "JSON": {
                                                "user_id": "%s",
                                                "ma_dvcs": "%s",
                                                "searchDynamic": {
                                                                "dfrom": "%s",
                                                                "dto": "%s",
                                                                "time_from": "%s",
                                                                "time_to": "%s",
                                                                "cmes_scheduling_code": "",
                                                                "cma_vt": "",
                                                                "cline_code": "",
                                                                "cid_oi": "",
                                                                "cma_dvcs": "%s",
                                                                "mau_bc": "002",
                                                                "gridid": "%s",
                                                                "index": 0,
                                                                "culture": "%s",
                                                                "limit": %d,
                                                                "offset": %d
                                                }
                                        }
                                }
                                """.formatted(
                                DEFAULT_USER_ID,
                                DEFAULT_COMPANY_CODE,
                                request.getDfrom(),
                                request.getDto(),
                                request.getTimeFrom(),
                                request.getTimeTo(),
                                DEFAULT_COMPANY_CODE,
                                GRID_MESBK_DANG_KY_NG,
                                DEFAULT_CULTURE,
                                resolveLimit(request, DEFAULT_DANG_KY_NG_LIMIT),
                                resolveOffset(request));
        }

        private String buildMesBkThayKhuonJson(OeeReportFilterRequest request) {

                return """
                                {
                                        "JSON": {
                                                "user_id": "%s",
                                                "searchDynamic": {
                                                        "dfrom": "%s",
                                                        "dto": "%s",
                                                        "time_from": "%s",
                                                        "time_to": "%s",
                                                        "cma_vt": "",
                                                        "cso_wo": "",
                                                        "cmachine_code": "",
                                                        "cstatus": "2",

                                                        "mau_bc": "%s",
                                                        "gridid": "%s",
                                                        "culture": "%s",

                                                        "keyword": "",
                                                        "search_dynamic_cols": [],

                                                        "index": 0,
                                                        "limit": %d,
                                                        "offset": %d
                                                }
                                        }
                                }
                                """
                                .formatted(
                                                DEFAULT_USER_ID,
                                                request.getDfrom(),
                                                request.getDto(),
                                                request.getTimeFrom(),
                                                request.getTimeTo(),
                                                DEFAULT_TEMPLATE_CODE,
                                                GRID_MESBK_THAY_KHUON,
                                                DEFAULT_CULTURE,
                                                resolveLimit(request, DEFAULT_THAY_KHUON_LIMIT),
                                                resolveOffset(request));
        }

        private String buildMesBkSetupJson(OeeReportFilterRequest request) {

                return """
                                {
                                        "JSON": {
                                                "user_id": "%s",
                                                "searchDynamic": {
                                                        "dfrom": "%s",
                                                        "dto": "%s",
                                                        "time_from": "%s",
                                                        "time_to": "%s",
                                                        "cma_vt": "",
                                                        "cso_wo": "",
                                                        "cmachine_code": "",
                                                        "cstatus": "2",
                                                        "mau_bc": "%s",
                                                        "gridid": "%s",
                                                        "culture": "%s",
                                                        "keyword": "",
                                                        "search_dynamic_cols": [],
                                                        "index": 0,
                                                        "limit": %d,
                                                        "offset": %d
                                                }
                                        }
                                }
                                """
                                .formatted(
                                                DEFAULT_USER_ID,
                                                request.getDfrom(),
                                                request.getDto(),
                                                request.getTimeFrom(),
                                                request.getTimeTo(),
                                                DEFAULT_TEMPLATE_CODE,
                                                GRID_MESBK_SETUP,
                                                DEFAULT_CULTURE,
                                                resolveLimit(request, DEFAULT_SETUP_LIMIT),
                                                resolveOffset(request));
        }

        private String buildPhatSinhJson(OeeReportFilterRequest request) {
                return """
                                {
                                        "JSON": {
                                                "user_id": "%s",
                                                "searchDynamic": {
                                                        "dfrom": "%s",
                                                        "dto": "%s",
                                                        "time_from": "%s",
                                                        "time_to": "%s",

                                                        "cma_vt": "",
                                                        "cso_wo": "",
                                                        "cmachine_code": "",
                                                        "cstatus": "2",

                                                        "mau_bc": "%s",
                                                        "gridid": "%s",
                                                        "culture": "%s",

                                                        "keyword": "",
                                                        "search_dynamic_cols": [],

                                                        "index": 0,
                                                        "limit": %d,
                                                        "offset": %d
                                                }
                                        }
                                }
                                """.formatted(
                                DEFAULT_USER_ID,
                                request.getDfrom(),
                                request.getDto(),
                                request.getTimeFrom(),
                                request.getTimeTo(),
                                DEFAULT_TEMPLATE_CODE,
                                GRID_MESBK_PHAT_SINH,
                                DEFAULT_CULTURE,
                                resolveLimit(request, DEFAULT_PHAT_SINH_LIMIT),
                                resolveOffset(request));
        }

        @Override
        public List<MachineOperationReportDTO> getMESBCKQVHPLV(
                        OeeReportFilterRequest request) {

                String jsonRequest = buildMesBckQvHplvJson(request);
                String dfrom = request.getDfrom();
                String dto = request.getDto();
                String machineLike = resolveMachineLike(request, "%");

                String sql = """
                                SELECT
                                    t.stt,
                                    t.id_oi,
                                    t.mes_scheduling_code,
                                    t.production_order,
                                    t.product_code,
                                    t.product_name,
                                    t.step_code,
                                    t.machine_code,
                                    t.create_date,
                                    t.create_time,
                                    t.end_date,
                                    t.end_time,
                                    t.time_working,
                                    t.time_start,
                                    t.time_real,
                                    t.quantity,
                                    t.in_process,
                                    t.sl_dong_goi,
                                    t.complete,
                                    t.ng,
                                    t.tong_ng_linh_kien,
                                    t.skip_shot,
                                    t.sl_chenh_lech,
                                    t.sl_them,
                                    t.hoan_thanh,
                                    t.ty_le_ng,
                                    t.so_ct_pnd,
                                    t.ma_khuon,
                                    t.chu_ky_ke_hoach,
                                    t.chu_ky_setup,
                                    t.chu_ky_thuc_te,
                                    t.cavity_ho_so_khuon,
                                    t.cavity_san_xuat,
                                    t.line_group_code1,
                                    t.line_group_code2,
                                    t.line_group_code3,
                                    t.thu_khuon_yn

                                FROM (
                                    SELECT
                                        a.*,

                                        (a.create_date::timestamp + a.create_time) AS start_ts,
                                        (a.end_date::timestamp + a.end_time) AS end_ts

                                    FROM mesbckqvhplv(?) a
                                ) t

                                WHERE
                                        t.start_ts < ?
                                        AND COALESCE(t.end_ts, NOW()) > ?
                                        AND (
                                                t.end_ts IS NULL
                                                OR t.end_ts >= ?
                                        )
                                        AND NOT (
                                                t.start_ts >= ?
                                                AND COALESCE(t.end_ts, NOW()) > ?
                                        )
                                        AND t.machine_code LIKE ?

                                ORDER BY t.machine_code
                                """;

                return tertiaryJdbcTemplate.query(
                                sql,
                                machineOperationRowMapper,
                                jsonRequest,
                                toTimestamp(dto, H_800),
                                toTimestamp(dfrom, H_740),
                                toTimestamp(dfrom, H_800),
                                toTimestamp(dto, H_740),
                                toTimestamp(dto, H_810),
                                machineLike);
        }

        @Override
        public List<NgReportDTO> getMESBKDangKyNG(OeeReportFilterRequest request) {
                String jsonRequest = buildDangKyNgJson(request);
                String dfrom = request.getDfrom();
                String dto = request.getDto();
                String machineLike = resolveMachineLike(request, "%");

                String sql = """
                                SELECT
                                        x.stt 			,
                                        x.line_code		,
                                        x.id_oi			,
                                        x.mes_scheduling_code	,
                                        x.create_date		,
                                        x.create_time		,
                                        x.end_date		,
                                        x.end_time		,
                                        x.product_code		,
                                        x.ten_vt 		,
                                        x.step_name		,
                                        x.ng_qty		,
                                        x.ma_loi		,
                                        x.ten_loi 		,
                                        x.nh_loi1 		,
                                        x.ma_nv 		,
                                        x.ten_nv 		,
                                        x.ngay_dk_ng 		,
                                        x.gio_dk_ng 		,
                                        x.nh_vt6 		,
                                        x.ten_kh 		,
                                        x.nh_kh1
                                FROM (
                                SELECT
                                        t.*,
                                        (t.create_date::timestamp + t.create_time) AS start_ts,
                                        (t.end_date::timestamp + t.end_time) AS end_ts
                                FROM mesbkdangkyng(?) t
                                ) x
                                WHERE
                                        x.start_ts < ?
                                        AND COALESCE(x.end_ts, NOW()) > ?
                                        AND (
                                                x.end_ts IS NULL
                                                OR x.end_ts >= ?
                                        )
                                        AND NOT (
                                                x.start_ts >= ?
                                                AND COALESCE(x.end_ts, NOW()) > ?
                                        )
                                        AND x.line_code LIKE ?
                                ORDER BY x.line_code
                                """;

                return tertiaryJdbcTemplate.query(
                                sql,
                                ngReportRowMapper,
                                jsonRequest,
                                toTimestamp(dto, H_800),
                                toTimestamp(dfrom, H_740),
                                toTimestamp(dfrom, H_800),
                                toTimestamp(dto, H_740),
                                toTimestamp(dto, H_810),
                                machineLike
                );
        }

        @Override
        public List<MoldChangeReportDTO> getMESBKThayKhuon(OeeReportFilterRequest request) {
                String jsonRequest = buildMesBkThayKhuonJson(request);

                String sql = """
                                SELECT
                                        b.stt		        ,
                                        b.so_ct		        ,
                                        b.ngay_ct	        ,
                                        b.so_wo		        ,
                                        b.ma_vt		        ,
                                        b.ten_vt	        ,
                                        b.ma_day_chuyen	        ,
                                        b.ma_khuon_len	        ,
                                        b.ma_khuon_xuong        ,
                                        b.ma_nv_th	        ,
                                        b.ten_nv_th	        ,
                                        b.ngay_bd_lenkhuon      ,
                                        b.tg_bd_lenkhuon        ,
                                        b.ngay_kt	        ,
                                        b.tg_kt_lenkhuon        ,
                                        b.tg_lenkhuon	        ,
                                        b.tg_phatsinh	        ,
                                        b.ma_loi	        ,
                                        b.ten_loi	        ,
                                        b.ngay_bd_ghiloi        ,
                                        b.tg_bd_ghiloi	        ,
                                        b.ngay_kt_ghiloi        ,
                                        b.tg_kt_ghiloi	        ,
                                        b.tg_xl		        ,
                                        b.ma_nv_xu_ly	        ,
                                        b.ten_nv_xu_ly	        ,
                                        b.pa_xu_ly	        ,
                                        b.ghi_chu_error	        ,
                                        b.trang_thai
                                FROM mesbkthaykhuon(?) b
                                """;

                return tertiaryJdbcTemplate.query(sql, moldChangeRowMapper, jsonRequest);
        }

        @Override
        public List<SetupReportDTO> getMESBKSetup(OeeReportFilterRequest request) {
                String jsonRequest = buildMesBkSetupJson(request);
                String sql = """
                                SELECT
                                        b.stt			,
                                        b.ma_day_chuyen	        ,
                                        b.ma_sp	        	,
                                        b.ten_sp		,
                                        b.chu_ky_tt		,
                                        b.number_shot		,
                                        b.ma_nv_th		,
                                        b.ten_nv_th		,
                                        b.ngay_bd_setup		,
                                        b.tg_bd_setup		,
                                        b.ngay_kt_setup		,
                                        b.tg_kt_setup		,
                                        b.tg_setup		,
                                        b.tg_phatsinh		,
                                        b.ma_loi		,
                                        b.ten_loi		,
                                        b.ngay_bd_ghiloi	,
                                        b.tg_bd_ghiloi		,
                                        b.ngay_kt_ghiloi	,
                                        b.tg_kt_ghiloi		,
                                        b.tg_xl			,
                                        b.ma_nv_xu_ly		,
                                        b.ten_nv_xu_ly		,
                                        b.pa_xu_ly		,
                                        b.ghi_chu_error		,
                                        b.trang_thai
                                FROM MESBKSetup(?) b
                                """;

                return tertiaryJdbcTemplate.query(sql, setupRowMapper, jsonRequest);
        }

        @Override
        public List<ProductionIssueReportDTO> getMESBKPhatSinh(OeeReportFilterRequest request) {
                String jsonRequest = buildPhatSinhJson(request);
                String machineLike = resolveMachineLike(request, DEFAULT_MACHINE_PREFIX + "%");
                String sql = """
                                SELECT
                                        b.stt			,
                                        b.id_oi			,
                                        b.ngay_ct		,
                                        b.so_ct			,
                                        b.ma_vt			,
                                        b.ten_vt		,
                                        b.ma_day_chuyen 	,
                                        b.ma_khuon		,
                                        b.ngay_bd_sanxuat	,
                                        b.tg_bd_sanxuat		,
                                        b.ngay_kt_sanxuat	,
                                        b.tg_kt_sanxuat		,
                                        b.tg_sanxuat		,
                                        b.tg_phatsinh		,
                                        b.ma_loi		,
                                        b.ten_loi		,
                                        b.ngay_bd_ghiloi	,
                                        b.tg_bd_ghiloi		,
                                        b.ngay_kt_ghiloi	,
                                        b.tg_kt_ghiloi		,
                                        b.tg_xl			,
                                        b.ma_nv_xu_ly		,
                                        b.ten_nv_xu_ly
                                FROM MESBKPhatSinh(?) b
                                WHERE b.ma_day_chuyen LIKE ?
                                   OR b.ma_day_chuyen IS NULL
                                   OR b.ma_day_chuyen = ''
                                """;

                return tertiaryJdbcTemplate.query(sql, productionIssueRowMapper, jsonRequest, machineLike);
        }

        @Override
        public List<?> debugOEE(LocalDate date) {

                return loadDebugData(date).get(GRID_MESBK_PHAT_SINH);

        }

        @Override
        public void exportDebugReportToExcel(LocalDate date, OutputStream os) throws Exception {

                org.apache.poi.openxml4j.util.ZipSecureFile.setMinInflateRatio(0.005);

                Map<String, List<?>> debugData = loadDebugData(date);

                try (Workbook workbook = new XSSFWorkbook()) {
                        for (Entry<String, List<?>> debugEntry : debugData.entrySet()) {
                                writeDebugSheet(workbook, debugEntry.getKey(), debugEntry.getValue());
                        }
                        workbook.write(os);
                }
        }

        private Map<String, List<?>> loadDebugData(LocalDate date) {

                OeeReportFilterRequest requestMESBCKQVHPLV = buildMachineOperationRequest(date);
                OeeReportFilterRequest requestMESBKDangKyNG = buildNgRequest(date);
                OeeReportFilterRequest requestMESBKThayKhuon = buildMoldChangeRequest(date);
                OeeReportFilterRequest requestMESBKSetup = buildSetupRequest(date);
                OeeReportFilterRequest requestMESBKPhatSinh = buildProductionIssueRequest(date);

                CompletableFuture<List<MachineOperationReportDTO>> machineFuture = CompletableFuture
                                .supplyAsync(() -> getMESBCKQVHPLV(requestMESBCKQVHPLV), reportFetchExecutor);
                CompletableFuture<List<NgReportDTO>> ngFuture = CompletableFuture
                                .supplyAsync(() -> getMESBKDangKyNG(requestMESBKDangKyNG), reportFetchExecutor);
                CompletableFuture<List<MoldChangeReportDTO>> moldFuture = CompletableFuture
                                .supplyAsync(() -> getMESBKThayKhuon(requestMESBKThayKhuon), reportFetchExecutor);
                CompletableFuture<List<SetupReportDTO>> setupFuture = CompletableFuture
                                .supplyAsync(() -> getMESBKSetup(requestMESBKSetup), reportFetchExecutor);
                CompletableFuture<List<ProductionIssueReportDTO>> phatSinhFuture = CompletableFuture
                                .supplyAsync(() -> getMESBKPhatSinh(requestMESBKPhatSinh), reportFetchExecutor);

                List<MachineOperationReportDTO> machineOperationReportDTOs = joinFuture(machineFuture,
                                GRID_MESBCKQVHPLV);
                List<NgReportDTO> ngReportData = joinFuture(ngFuture, GRID_MESBK_DANG_KY_NG);
                List<MoldChangeReportDTO> moldChangeReportData = joinFuture(moldFuture, GRID_MESBK_THAY_KHUON);
                List<SetupReportDTO> setupReportData = joinFuture(setupFuture, GRID_MESBK_SETUP);
                List<ProductionIssueReportDTO> phatSinhReportData = joinFuture(phatSinhFuture, GRID_MESBK_PHAT_SINH);

                normalizeMachineOperationReport(machineOperationReportDTOs);
                normalizeNgReport(ngReportData);
                normalizeMoldChangeReport(moldChangeReportData);
                normalizeMachineSetupReport(setupReportData);
                normalizePhatSinhReportData(phatSinhReportData, date);

                Map<String, List<?>> debugData = new LinkedHashMap<>();
                debugData.put(GRID_MESBCKQVHPLV, machineOperationReportDTOs);
                debugData.put(GRID_MESBK_DANG_KY_NG, ngReportData);
                debugData.put(GRID_MESBK_THAY_KHUON, moldChangeReportData);
                debugData.put(GRID_MESBK_SETUP, setupReportData);
                debugData.put(GRID_MESBK_PHAT_SINH, phatSinhReportData);

                return debugData;

        }

        private void writeDebugSheet(Workbook workbook, String sheetName, List<?> data) {

                Sheet sheet = workbook.createSheet(sheetName);

                if (data == null || data.isEmpty()) {
                        Row headerRow = sheet.createRow(0);
                        headerRow.createCell(0).setCellValue("No data");
                        return;
                }

                Map<String, Object> firstRowMap = objectMapper.convertValue(
                                data.get(0),
                                new TypeReference<Map<String, Object>>() {
                                });

                List<String> headers = new ArrayList<>(firstRowMap.keySet());

                Row headerRow = sheet.createRow(0);
                for (int colIdx = 0; colIdx < headers.size(); colIdx++) {
                        headerRow.createCell(colIdx).setCellValue(headers.get(colIdx));
                }

                int rowIdx = 1;
                for (Object item : data) {
                        Map<String, Object> rowMap = objectMapper.convertValue(
                                        item,
                                        new TypeReference<Map<String, Object>>() {
                                        });

                        Row row = sheet.createRow(rowIdx++);

                        for (int colIdx = 0; colIdx < headers.size(); colIdx++) {
                                String header = headers.get(colIdx);
                                Object value = rowMap.get(header);
                                setDebugCellValue(row.createCell(colIdx), value);
                        }
                }
        }

        private void setDebugCellValue(Cell cell, Object value) {

                if (value == null) {
                        cell.setCellValue("");
                        return;
                }

                if (value instanceof Number number) {
                        cell.setCellValue(number.doubleValue());
                        return;
                }

                if (value instanceof Boolean bool) {
                        cell.setCellValue(bool);
                        return;
                }

                cell.setCellValue(value.toString());

        }

        private void normalizeMachineOperationReport(List<MachineOperationReportDTO> list) {
                list.sort(Comparator.comparing(MachineOperationReportDTO::getMachine_code));
        }

        private void normalizeNgReport(List<NgReportDTO> list) {
                list.sort(Comparator.comparing(NgReportDTO::getLine_code));
        }

        private void normalizeMoldChangeReport(List<MoldChangeReportDTO> list) {

                MoldChangeReportDTO previousValidRow = null;

                list.removeIf(item -> item.getStt() != null
                                && item.getStt() == 0
                                && (item.getTg_xl() == null
                                                || item.getTg_xl().compareTo(BigDecimal.ZERO) == 0));

                for (MoldChangeReportDTO item : list) {

                        boolean needFill = item.getStt() != null
                                        && item.getStt() == 0
                                        && (item.getMa_day_chuyen() == null
                                                        || item.getMa_day_chuyen().trim().isEmpty());

                        if (needFill && previousValidRow != null) {


                                item.setStt(previousValidRow.getStt());

                                item.setSo_ct(previousValidRow.getSo_ct());
                                item.setNgay_ct(previousValidRow.getNgay_ct());

                                item.setSo_wo(previousValidRow.getSo_wo());

                                item.setMa_vt(previousValidRow.getMa_vt());
                                item.setTen_vt(previousValidRow.getTen_vt());

                                item.setMa_day_chuyen(previousValidRow.getMa_day_chuyen());

                                item.setMa_khuon_len(previousValidRow.getMa_khuon_len());
                                item.setMa_khuon_xuong(previousValidRow.getMa_khuon_xuong());

                                item.setMa_nv_th(previousValidRow.getMa_nv_th());
                                item.setTen_nv_th(previousValidRow.getTen_nv_th());


                                item.setNgay_bd_lenkhuon(item.getNgay_bd_ghiloi());
                                item.setTg_bd_lenkhuon(item.getTg_bd_ghiloi());

                                item.setNgay_kt(item.getNgay_kt_ghiloi());
                                item.setTg_kt_lenkhuon(item.getTg_kt_ghiloi());

                                item.setTg_lenkhuon(item.getTg_xl());
                        }

                        if (item.getStt() != null && item.getStt() != 0) {
                                previousValidRow = item;
                        }

                        if (item.getMa_loi() == null || item.getMa_loi().trim().isEmpty()) {
                                item.setMa_loi(ERROR_CODE_B1);
                        }
                }
                list.sort(Comparator.comparing(MoldChangeReportDTO::getMa_day_chuyen));
        }

        private void normalizeMachineSetupReport(List<SetupReportDTO> list) {

                SetupReportDTO previousValidRow = null;

                list.removeIf(item -> (item.getStt() != null && item.getStt() == 0)
                                && (item.getTg_xl() == null || item.getTg_xl().compareTo(BigDecimal.ZERO) == 0)
                                || (LocalDate.of(1900, 1, 1).equals(item.getNgay_kt_setup())
                                                && item.getTg_setup().compareTo(BigDecimal.ZERO) < 0));
                // ĐăngNH thêm 30/6
                list.removeIf((item -> item.getStt() != null
                        && item.getStt() == 0
                        && (item.getMa_day_chuyen() == null)
                        || item.getMa_day_chuyen().trim().isEmpty()));

                for (SetupReportDTO item : list) {

                        boolean needFill = item.getStt() != null
                                        && item.getStt() == 0
                                        && (item.getMa_day_chuyen() == null
                                                        || item.getMa_day_chuyen().trim().isEmpty());

                        if (needFill && previousValidRow != null) {


                                item.setStt(previousValidRow.getStt());

                                item.setMa_day_chuyen(previousValidRow.getMa_day_chuyen());
                                item.setMa_sp(previousValidRow.getMa_sp());
                                item.setTen_sp(previousValidRow.getTen_sp());
                                item.setChu_ky_tt(previousValidRow.getChu_ky_tt());
                                item.setNumber_shot(previousValidRow.getNumber_shot());
                                item.setMa_day_chuyen(previousValidRow.getMa_day_chuyen());
                                item.setMa_nv_th(previousValidRow.getMa_nv_th());
                                item.setTen_nv_th(previousValidRow.getTen_nv_th());


                                item.setNgay_bd_setup(item.getNgay_bd_ghiloi());
                                item.setTg_bd_setup(item.getTg_bd_ghiloi());
                                item.setNgay_kt_setup(item.getNgay_kt_ghiloi());
                                item.setTg_kt_setup(item.getTg_kt_ghiloi());
                                item.setTg_setup(item.getTg_xl());
                        }

                        if (item.getStt() != null && item.getStt() != 0) {
                                previousValidRow = item;
                        }

                        if (item.getMa_loi() == null || item.getMa_loi().trim().isEmpty()) {
                                item.setMa_loi(ERROR_CODE_B2);
                        }

                }
                list.sort(Comparator.comparing(SetupReportDTO::getMa_day_chuyen));
        }

        private void normalizePhatSinhReportData(List<ProductionIssueReportDTO> list, LocalDate productionDate) {

                LocalDateTime startBoundary = productionDate.atTime(8, 0);
                LocalDateTime endBoundary = productionDate.plusDays(1).atTime(8, 0);

                list.removeIf(item -> {

                        if (item.getNgay_bd_ghiloi() == null
                                        || item.getTg_bd_ghiloi() == null
                                        || item.getNgay_kt_ghiloi() == null
                                        || item.getTg_kt_ghiloi() == null) {
                                return false;
                        }

                        LocalDateTime start = LocalDateTime.of(
                                        item.getNgay_bd_ghiloi(),
                                        item.getTg_bd_ghiloi());

                        LocalDateTime end = LocalDateTime.of(
                                        item.getNgay_kt_ghiloi(),
                                        item.getTg_kt_ghiloi());

                        boolean beforeRange = !end.isAfter(startBoundary);

                        boolean afterRange = !start.isBefore(endBoundary);

                        return beforeRange || afterRange;
                });

                ProductionIssueReportDTO previousValidRow = null;

                for (ProductionIssueReportDTO item : list) {

                        boolean needFill = item.getStt() != null
                                        && item.getStt() == 0
                                        && (item.getMa_day_chuyen() == null
                                                        || item.getMa_day_chuyen().trim().isEmpty());

                        if (needFill && previousValidRow != null) {

                                item.setStt(previousValidRow.getStt());
                                item.setMa_day_chuyen(previousValidRow.getMa_day_chuyen());
                                item.setId_oi(previousValidRow.getId_oi());
                                item.setNgay_ct(previousValidRow.getNgay_ct());
                                item.setSo_ct(previousValidRow.getSo_ct());
                                item.setMa_vt(previousValidRow.getMa_vt());
                                item.setTen_vt(previousValidRow.getTen_vt());
                                item.setMa_khuon(previousValidRow.getMa_khuon());

                                item.setNgay_bd_sanxuat(previousValidRow.getNgay_bd_sanxuat());
                                item.setTg_bd_sanxuat(previousValidRow.getTg_bd_sanxuat());

                                item.setNgay_kt_sanxuat(previousValidRow.getNgay_kt_sanxuat());
                                item.setTg_kt_sanxuat(previousValidRow.getTg_kt_sanxuat());

                                item.setTg_sanxuat(previousValidRow.getTg_sanxuat());
                                item.setTg_phatsinh(previousValidRow.getTg_phatsinh());



                                if (item.getNgay_bd_ghiloi() != null
                                                && item.getTg_bd_ghiloi() != null
                                                && item.getNgay_kt_ghiloi() != null
                                                && item.getTg_kt_ghiloi() != null
                                                && item.getNgay_ct() != null) {

                                        LocalDateTime start = LocalDateTime.of(
                                                        item.getNgay_bd_ghiloi(),
                                                        item.getTg_bd_ghiloi());

                                        LocalDateTime end = LocalDateTime.of(
                                                        item.getNgay_kt_ghiloi(),
                                                        item.getTg_kt_ghiloi());

                                        if (start.isBefore(startBoundary)) {
                                                start = startBoundary;
                                        }

                                        if (end.isAfter(endBoundary)) {
                                                end = endBoundary;
                                        }

                                        item.setNgay_bd_ghiloi(start.toLocalDate());
                                        item.setTg_bd_ghiloi(start.toLocalTime());
                                        item.setNgay_kt_ghiloi(end.toLocalDate());
                                        item.setTg_kt_ghiloi(end.toLocalTime());

                                        long seconds = Duration.between(start, end).getSeconds();

                                        BigDecimal tgPhatSinh = BigDecimal.valueOf(seconds)
                                                        .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);

                                        item.setTg_phatsinh(tgPhatSinh);
                                        item.setTg_xl(tgPhatSinh);
                                }
                        }

                        if (item.getStt() != null && item.getStt() != 0) {
                                previousValidRow = item;
                        }
                }

                list.removeIf(item -> item.getMa_loi() == null || item.getMa_loi().trim().isEmpty());

                list.sort(
                                Comparator.comparing(
                                                ProductionIssueReportDTO::getMa_day_chuyen,
                                                Comparator.nullsLast(String::compareTo)));
        }

        private <T> T joinFuture(CompletableFuture<T> future, String sourceName) {
                try {
                        return future.join();
                } catch (CompletionException ex) {
                        Throwable cause = ex.getCause() == null ? ex : ex.getCause();
                        throw new RuntimeException("Lỗi khi tải dữ liệu: " + sourceName + " - " + cause.getMessage(),
                                        cause);
                }
        }

        public LocalDate getProductionDate(LocalDateTime time) {

                LocalTime boundary = LocalTime.of(8, 0);

                if (time.toLocalTime().isBefore(boundary)) {
                        return time.toLocalDate().minusDays(1);
                }

                return time.toLocalDate();
        }

        private OeeReportFilterRequest buildRequest(LocalDate date, String timeFrom, String timeTo, String machineCode,
                        int limit, int offset) {
                return OeeReportFilterRequest.builder()
                                .dfrom(date.toString())
                                .dto(date.plusDays(1).toString())
                                .timeFrom(timeFrom)
                                .timeTo(timeTo)
                                .machineCode(machineCode)
                                .limit(limit)
                                .offset(offset)
                                .build();
        }

        private OeeReportFilterRequest buildMachineOperationRequest(LocalDate date) {
                return buildRequest(
                                date,
                                SETUP_JSON_H740.substring(0, 5),
                                SETUP_JSON_H2300,
                                DEFAULT_MACHINE_PREFIX,
                                DEFAULT_LIMIT,
                                DEFAULT_OFFSET);
        }

        private OeeReportFilterRequest buildNgRequest(LocalDate date) {
                return buildRequest(
                                date,
                                SETUP_JSON_H740,
                                SETUP_JSON_H2300,
                                DEFAULT_MACHINE_PREFIX,
                                DEFAULT_DANG_KY_NG_LIMIT,
                                DEFAULT_OFFSET);
        }

        private OeeReportFilterRequest buildMoldChangeRequest(LocalDate date) {
                return buildRequest(
                                date,
                                SETUP_JSON_H800,
                                SETUP_JSON_H800,
                                "",
                                DEFAULT_THAY_KHUON_LIMIT,
                                DEFAULT_OFFSET);
        }

        private OeeReportFilterRequest buildSetupRequest(LocalDate date) {
                return buildRequest(
                                date,
                                SETUP_JSON_H800,
                                SETUP_JSON_H800,
                                "",
                                DEFAULT_SETUP_LIMIT,
                                DEFAULT_OFFSET);
        }

        private OeeReportFilterRequest buildProductionIssueRequest(LocalDate date) {
                return buildRequest(
                                date,
                                SETUP_JSON_H000,
                                SETUP_JSON_H2300,
                                DEFAULT_MACHINE_PREFIX,
                                DEFAULT_PHAT_SINH_LIMIT,
                                DEFAULT_OFFSET);
        }

        private String resolveMachineLike(OeeReportFilterRequest request, String defaultValue) {
                String machineCode = request.getMachineCode();
                if (machineCode == null || machineCode.trim().isEmpty()) {
                        return defaultValue;
                }
                return machineCode.trim() + "%";
        }

        private int resolveLimit(OeeReportFilterRequest request, int defaultValue) {
                return request.getLimit() == null ? defaultValue : request.getLimit();
        }

        private int resolveOffset(OeeReportFilterRequest request) {
                return request.getOffset() == null ? DEFAULT_OFFSET : request.getOffset();
        }

        private Timestamp toTimestamp(String date, String time) {
                return Timestamp.valueOf(date + " " + time);
        }

        private BigDecimal readAsBigDecimal(ResultSet rs, String columnName) throws SQLException {
                String rawValue = rs.getString(columnName);
                if (rawValue == null) {
                        return null;
                }

                String normalized = rawValue.trim();
                if (normalized.isEmpty()) {
                        return null;
                }

                if (normalized.contains(":")) {
                        return timeLikeToSeconds(normalized);
                }

                try {
                        return new BigDecimal(normalized);
                } catch (NumberFormatException ex) {
                        throw new SQLException("Unable to parse  column '" + columnName + "' with value: "
                                        + normalized, ex);
                }
        }

        private BigDecimal timeLikeToSeconds(String text) {
                String value = text.trim();
                boolean negative = value.startsWith("-");
                if (negative) {
                        value = value.substring(1).trim();
                }

                long daySeconds = 0L;
                if (value.matches("^\\d+\\s+days?\\s+.+$")) {
                        String[] daySplit = value.split("\\s+", 3);
                        daySeconds = Long.parseLong(daySplit[0]) * 24L * 60L * 60L;
                        value = daySplit[2];
                }

                String[] parts = value.split(":");
                if (parts.length != 3) {
                        throw new IllegalArgumentException("Unsupported  format: " + text);
                }

                BigDecimal hours = new BigDecimal(parts[0]);
                BigDecimal minutes = new BigDecimal(parts[1]);
                BigDecimal seconds = new BigDecimal(parts[2]);

                BigDecimal totalSeconds = hours.multiply(BigDecimal.valueOf(3600))
                                .add(minutes.multiply(BigDecimal.valueOf(60)))
                                .add(seconds)
                                .add(BigDecimal.valueOf(daySeconds));

                return negative ? totalSeconds.negate() : totalSeconds;
        }

        private LocalDate toLocalDate(Date value) {
                return value == null ? null : value.toLocalDate();
        }

        private LocalTime toLocalTime(Time value) {
                return value == null ? null : value.toLocalTime();
        }

        @Override
        public void exportMachineOperationReportToExcel(MultipartFile file, LocalDate date,
                        OutputStream os)
                        throws Exception {

                org.apache.poi.openxml4j.util.ZipSecureFile.setMinInflateRatio(0.005);
                org.apache.poi.util.IOUtils.setByteArrayMaxOverride(POI_BYTE_ARRAY_MAX_OVERRIDE);

                OeeReportFilterRequest requestMESBCKQVHPLV = buildMachineOperationRequest(date);
                OeeReportFilterRequest requestMESBKDangKyNG = buildNgRequest(date);
                OeeReportFilterRequest requestMESBKThayKhuon = buildMoldChangeRequest(date);
                OeeReportFilterRequest requestMESBKSetup = buildSetupRequest(date);

                LocalDate previousDate = date.minusDays(1);

                OeeReportFilterRequest requestMESBKPhatSinh = buildProductionIssueRequest(date);

                long exportStart = System.nanoTime();
                log.info("[OEE-EXPORT] BAT DAU export cho ngay {}", date);

                CompletableFuture<List<MachineOperationReportDTO>> machineFuture = CompletableFuture
                                .supplyAsync(() -> timed("DB.mesbckqvhplv",
                                                () -> getMESBCKQVHPLV(requestMESBCKQVHPLV)), reportFetchExecutor);
                CompletableFuture<List<NgReportDTO>> ngFuture = CompletableFuture
                                .supplyAsync(() -> timed("DB.mesbkdangkyng",
                                                () -> getMESBKDangKyNG(requestMESBKDangKyNG)), reportFetchExecutor);
                CompletableFuture<List<MoldChangeReportDTO>> moldFuture = CompletableFuture
                                .supplyAsync(() -> timed("DB.mesbkthaykhuon",
                                                () -> getMESBKThayKhuon(requestMESBKThayKhuon)), reportFetchExecutor);
                CompletableFuture<List<SetupReportDTO>> setupFuture = CompletableFuture
                                .supplyAsync(() -> timed("DB.mesbksetup",
                                                () -> getMESBKSetup(requestMESBKSetup)), reportFetchExecutor);
                CompletableFuture<List<ProductionIssueReportDTO>> phatSinhFuture = CompletableFuture
                                .supplyAsync(() -> timed("DB.mesbkphatsinh",
                                                () -> getMESBKPhatSinh(requestMESBKPhatSinh)), reportFetchExecutor);

                long fetchStart = System.nanoTime();
                CompletableFuture.allOf(
                                machineFuture,
                                ngFuture,
                                moldFuture,
                                setupFuture,
                                phatSinhFuture).join();
                logElapsed("PHASE fetch 5 DB song song", fetchStart);

                List<MachineOperationReportDTO> machineOperationReportDTOs = joinFuture(machineFuture,
                                GRID_MESBCKQVHPLV);
                List<NgReportDTO> ngReportData = joinFuture(ngFuture, GRID_MESBK_DANG_KY_NG);
                List<MoldChangeReportDTO> moldChangeReportData = joinFuture(moldFuture, GRID_MESBK_THAY_KHUON);
                List<SetupReportDTO> setupReportData = joinFuture(setupFuture, GRID_MESBK_SETUP);
                List<ProductionIssueReportDTO> phatSinhReportData = joinFuture(phatSinhFuture, GRID_MESBK_PHAT_SINH);

                log.info("[OEE-EXPORT] So dong: machine={}, ng={}, mold={}, setup={}, phatSinh={}",
                                machineOperationReportDTOs.size(), ngReportData.size(), moldChangeReportData.size(),
                                setupReportData.size(), phatSinhReportData.size());

                long normalizeStart = System.nanoTime();
                normalizeMachineOperationReport(machineOperationReportDTOs);
                normalizeNgReport(ngReportData);
                normalizeMoldChangeReport(moldChangeReportData);
                normalizeMachineSetupReport(setupReportData);
                normalizePhatSinhReportData(phatSinhReportData, date);
                logElapsed("PHASE normalize", normalizeStart);

                long openStart = System.nanoTime();
                try (
                                InputStream is = file.getInputStream();
                                Workbook workbook = WorkbookFactory.create(is)) {
                        logElapsed("PHASE mo template (WorkbookFactory.create)", openStart);

                        long nhapNgStart = System.nanoTime();
                        processSheetNhapNG(workbook, ngReportData, machineOperationReportDTOs, setupReportData, date);
                        logElapsed("PHASE sheet Nhap NG", nhapNgStart);

                        long kqsxStart = System.nanoTime();
                        processSheetKQSX(workbook, machineOperationReportDTOs, previousDate, date);
                        logElapsed("PHASE sheet KQSX", kqsxStart);

                        long dungMayStart = System.nanoTime();
                        processSheetDungMay(workbook, date, moldChangeReportData, setupReportData, phatSinhReportData,
                                        machineOperationReportDTOs);
                        logElapsed("PHASE sheet Dung May", dungMayStart);

                        long writeStart = System.nanoTime();
                        workbook.write(os);
                        logElapsed("PHASE workbook.write", writeStart);
                }

                logElapsed("TONG export", exportStart);
        }

        private <T> T timed(String label, Supplier<T> task) {
                long start = System.nanoTime();
                try {
                        return task.get();
                } finally {
                        logElapsed(label, start);
                }
        }

        private void logElapsed(String label, long startNano) {
                long ms = (System.nanoTime() - startNano) / 1_000_000;
                log.info("[OEE-EXPORT][timing] {} = {} ms", label, ms);
        }

        private void processSheetDungMay(Workbook workbook, LocalDate date,
                        List<MoldChangeReportDTO> moldChangeReportData, List<SetupReportDTO> setupReportData,
                        List<ProductionIssueReportDTO> phatSinhReportData,
                        List<MachineOperationReportDTO> machineOperationReportData) {
                dungMaySheetWriter.write(
                                workbook,
                                date,
                                moldChangeReportData,
                                setupReportData,
                                phatSinhReportData,
                                machineOperationReportData);
        }

        private void processSheetKQSX(Workbook workbook, List<MachineOperationReportDTO> machineOperationReportDTOs,
                        LocalDate previousDate, LocalDate date) {
                CompletableFuture<List<KhsxItemDTO>> khsxTodayFuture = CompletableFuture
                                .supplyAsync(() -> timed("API.KHSX today",
                                                () -> getKhsxByDate(date)), reportFetchExecutor);
                CompletableFuture<List<KhsxItemDTO>> khsxPreviousDayFuture = CompletableFuture
                                .supplyAsync(() -> timed("API.KHSX previous",
                                                () -> getKhsxByDate(previousDate)), reportFetchExecutor);
                CompletableFuture<Map<String, ProductCodeMapping>> productMappingFuture = CompletableFuture
                                .supplyAsync(() -> timed("DB.productCodeMapping.findAll",
                                                () -> productCodeMappingRepository.findAll()
                                                .stream()
                                                .filter(mapping -> mapping.getKhsxProductCode() != null
                                                                && mapping.getMesProductCode() != null)
                                                .collect(Collectors.toMap(
                                                                ProductCodeMapping::getKhsxProductCode,
                                                                Function.identity(),
                                                                (a, b) -> a))),
                                                reportFetchExecutor);

                long kqsxFetchStart = System.nanoTime();
                List<KhsxItemDTO> data = joinFuture(khsxTodayFuture, "KHSX_today");
                List<KhsxItemDTO> previousDayData = joinFuture(khsxPreviousDayFuture, "KHSX_previous_day");
                Map<String, ProductCodeMapping> productMappingMap = joinFuture(productMappingFuture,
                                "product_code_mapping");
                logElapsed("  KQSX fetch (KHSX x2 + mapping song song)", kqsxFetchStart);

                long kqsxWriteStart = System.nanoTime();
                Map<String, KhsxItemDTO> dataMap = buildMesProductKhsxMap(data, productMappingMap);
                Map<String, KhsxItemDTO> previousDayDataMap = buildMesProductKhsxMap(previousDayData,
                                productMappingMap);
                OeeKqsxSheetWriter.WriteResult result = kqsxSheetWriter.write(
                                workbook,
                                machineOperationReportDTOs,
                                date,
                                dataMap,
                                previousDayDataMap,
                                WEEK_FIELDS);
                logElapsed("  KQSX write sheet", kqsxWriteStart);

                if (!result.getMissingKhsxCodes().isEmpty()) {
                        log.warn("Không tìm thấy mapping KHSX cho {} mã sản phẩm MES: {}",
                                        result.getMissingKhsxCodes().size(),
                                        String.join(", ", result.getMissingKhsxCodes()));
                }

                if (!result.getFallbackQCodes().isEmpty()) {
                        log.info("Đã fallback cột Q (chu kỳ kế hoạch) từ ngày {} cho {} mã sản phẩm: {}",
                                        previousDate,
                                        result.getFallbackQCodes().size(),
                                        String.join(", ", result.getFallbackQCodes()));
                }

        }

        private void processSheetNhapNG(Workbook workbook, List<NgReportDTO> ngReportData,
                        List<MachineOperationReportDTO> machineOperationReportDTOs,
                        List<SetupReportDTO> setupReportData, LocalDate date) {
                nhapNgSheetWriter.write(
                                workbook,
                                ngReportData,
                                machineOperationReportDTOs,
                                setupReportData,
                                date,
                                WEEK_FIELDS);
        }

        @PreDestroy
        void shutdownReportFetchExecutor() {
                reportFetchExecutor.shutdown();
                try {
                        if (!reportFetchExecutor.awaitTermination(5, TimeUnit.SECONDS)) {
                                reportFetchExecutor.shutdownNow();
                        }
                } catch (InterruptedException ex) {
                        reportFetchExecutor.shutdownNow();
                        Thread.currentThread().interrupt();
                }
        }

        private Map<String, KhsxItemDTO> buildMesProductKhsxMap(List<KhsxItemDTO> data,
                        Map<String, ProductCodeMapping> productMappingMap) {
                Map<String, KhsxItemDTO> dataMap = new HashMap<>();

                for (KhsxItemDTO item : data) {

                        String khsxCode = item.getMaSp();

                        if (khsxCode == null) {
                                continue;
                        }

                        ProductCodeMapping mapping = productMappingMap.get(khsxCode);

                        if (mapping == null) {
                                continue;
                        }

                        String mesProductCode = mapping.getMesProductCode();

                        if (mesProductCode == null) {
                                continue;
                        }

                        dataMap.put(mesProductCode, item);
                }

                return dataMap;
        }

        public List<KhsxItemDTO> getKhsxByDate(LocalDate date) {

                try {
                        String url = khsxApiUrl + "?ngay=" + date;

                        ResponseEntity<String> response = restTemplate.getForEntity(
                                        url,
                                        String.class);

                        if (!response.getStatusCode().is2xxSuccessful()
                                        || response.getBody() == null) {

                                throw new RuntimeException("Không lấy được dữ liệu KHSX");
                        }

                        JsonNode root = objectMapper.readTree(response.getBody());

                        JsonNode messageNode = root.get("message");

                        if (messageNode == null || !messageNode.isArray()) {
                                return Collections.emptyList();
                        }

                        return objectMapper.readValue(
                                        messageNode.toString(),
                                        new TypeReference<List<KhsxItemDTO>>() {
                                        });

                } catch (Exception ex) {
                        throw new RuntimeException(
                                        "Lỗi khi gọi API KHSX: " + ex.getMessage(),
                                        ex);
                }
        }
}