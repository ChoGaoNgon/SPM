package htmp.codien.quanlycodien.modules.employee.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class EmployeeSyncDTO {

    private String maNV;
    private String hoVaTen;
    private String hoVaTenDem;
    private String ten;
    private String gioiTinh;
    private LocalDate ngaySinh;

    private String email;
    private String mobilePhone;

    private LocalDate ngayVaoCty;
    private String trangThai;

    private Integer maChamCong;

    private String chucDanh;
    private String boPhan;
    private String phongBan;
}
