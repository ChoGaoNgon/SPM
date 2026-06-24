package htmp.codien.quanlycodien.modules.session.service;

import htmp.codien.quanlycodien.modules.auth.dto.ActiveSessionDTO;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.session.entity.EmployeeSession;
import htmp.codien.quanlycodien.modules.session.repository.EmployeeSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeSessionServiceImpl implements EmployeeSessionService {

    private final EmployeeSessionRepository sessionRepository;
    private final TokenStoreService tokenStoreService;

    @Override
    public EmployeeSession createSession(Employee employee, String token, String deviceInfo, String ipAddress,
            Duration sessionTtl) {

        sessionRepository.findByEmployeeIdAndActiveTrue(employee.getId())
                .forEach(s -> {
                    s.setActive(false);
                    sessionRepository.save(s);
                });

        EmployeeSession session = EmployeeSession.builder()
                .employee(employee)
                .token(token)
                .deviceInfo(deviceInfo)
                .ipAddress(ipAddress)
                .expiredAt(LocalDateTime.now().plus(sessionTtl))
                .active(true)
                .build();

        return sessionRepository.save(session);
    }

    @Override
    public boolean isValidToken(String token) {
        return sessionRepository.findByTokenAndActiveTrue(token)
                .filter(session -> session.getExpiredAt().isAfter(LocalDateTime.now()))
                .isPresent();
    }

    @Override
    public List<EmployeeSession> getActiveSessions(Long employeeId) {
        return sessionRepository.findByEmployeeIdAndActiveTrue(employeeId);
    }

    @Override
    public void invalidateSession(String token) {
        sessionRepository.findByTokenAndActiveTrue(token).ifPresent(session -> {
            session.setActive(false);
            sessionRepository.save(session);
        });
    }

    @Override
    public void invalidateEmployeeSessions(Long employeeId) {
        sessionRepository.findByEmployeeIdAndActiveTrue(employeeId)
                .forEach(session -> {
                    session.setActive(false);
                    sessionRepository.save(session);
                });
    }

    @Override
    public void forceLogoutEmployee(Long employeeId, String message, String reason) {
        tokenStoreService.revokeAllTokensForEmployee(employeeId);
        tokenStoreService.revokeAllRefreshTokensForEmployee(employeeId);
        invalidateEmployeeSessions(employeeId);
    }

    @Override
    public List<ActiveSessionDTO> getActiveSessions() {
        return sessionRepository.findActiveSessions();
    }
}