package htmp.codien.quanlycodien.modules.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ActiveSessionDTO {
    private Long sessionId;
    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private String ipAddress;
    private String deviceInfo;
    private LocalDateTime createdAt;
    private LocalDateTime expiredAt;
    private boolean active;
}