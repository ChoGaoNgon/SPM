package htmp.codien.quanlycodien.modules.auth.dto;

import lombok.Data;

@Data
public class ChangePasswordRequest {
    private Long employeeId;
    private String oldPassword;
    private String newPassword;
}