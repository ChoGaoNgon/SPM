package htmp.codien.quanlycodien.modules.session.service;

import java.time.Duration;

public interface TokenStoreService {
    void saveToken(Long employeeId, String token, Duration ttl);

    void saveRefreshToken(Long employeeId, String token, Duration ttl);

    boolean isTokenActive(String token);

    boolean isRefreshTokenActive(String token);

    void revokeToken(String token);

    void revokeRefreshToken(String token);

    void revokeAllTokensForEmployee(Long employeeId);

    void revokeAllRefreshTokensForEmployee(Long employeeId);
}
