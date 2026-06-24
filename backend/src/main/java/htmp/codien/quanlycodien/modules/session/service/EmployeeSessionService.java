package htmp.codien.quanlycodien.modules.session.service;

import htmp.codien.quanlycodien.modules.auth.dto.ActiveSessionDTO;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.session.entity.EmployeeSession;

import java.time.Duration;
import java.util.List;

public interface EmployeeSessionService {

    EmployeeSession createSession(Employee employee, String token, String deviceInfo, String ipAddress,
            Duration sessionTtl);

    boolean isValidToken(String token);

    List<EmployeeSession> getActiveSessions(Long employeeId);

    List<ActiveSessionDTO> getActiveSessions();

    void invalidateSession(String token);

    void invalidateEmployeeSessions(Long employeeId);

    void forceLogoutEmployee(Long employeeId, String message, String reason);
}