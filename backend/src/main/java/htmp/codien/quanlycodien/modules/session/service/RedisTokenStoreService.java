package htmp.codien.quanlycodien.modules.session.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RedisTokenStoreService implements TokenStoreService {

    private static final String ACCESS_PREFIX = "auth:access:";
    private static final String REFRESH_PREFIX = "auth:refresh:";
    private static final String USER_TOKEN_SET_PREFIX = "auth:user:";
    private static final String USER_ACCESS_TOKEN_SET_SUFFIX = ":access_tokens";
    private static final String USER_REFRESH_TOKEN_SET_SUFFIX = ":refresh_tokens";

    private final StringRedisTemplate redisTemplate;

    @Override
    public void saveToken(Long employeeId, String token, Duration ttl) {
        String tokenHash = hashToken(token);
        String tokenKey = getAccessTokenKey(tokenHash);
        String userSetKey = getUserAccessTokenSetKey(employeeId);

        redisTemplate.opsForValue().set(tokenKey, String.valueOf(employeeId), ttl);
        redisTemplate.opsForSet().add(userSetKey, tokenHash);
        redisTemplate.expire(userSetKey, ttl);
    }

    @Override
    public void saveRefreshToken(Long employeeId, String token, Duration ttl) {
        String tokenHash = hashToken(token);
        String tokenKey = getRefreshTokenKey(tokenHash);
        String userSetKey = getUserRefreshTokenSetKey(employeeId);

        redisTemplate.opsForValue().set(tokenKey, String.valueOf(employeeId), ttl);
        redisTemplate.opsForSet().add(userSetKey, tokenHash);
        redisTemplate.expire(userSetKey, ttl);
    }

    @Override
    public boolean isTokenActive(String token) {
        String tokenHash = hashToken(token);
        return Boolean.TRUE.equals(redisTemplate.hasKey(getAccessTokenKey(tokenHash)));
    }

    @Override
    public boolean isRefreshTokenActive(String token) {
        String tokenHash = hashToken(token);
        return Boolean.TRUE.equals(redisTemplate.hasKey(getRefreshTokenKey(tokenHash)));
    }

    @Override
    public void revokeToken(String token) {
        String tokenHash = hashToken(token);
        String tokenKey = getAccessTokenKey(tokenHash);

        String employeeId = redisTemplate.opsForValue().get(tokenKey);
        redisTemplate.delete(tokenKey);

        if (employeeId != null) {
            redisTemplate.opsForSet().remove(getUserAccessTokenSetKey(Long.valueOf(employeeId)), tokenHash);
        }
    }

    @Override
    public void revokeRefreshToken(String token) {
        String tokenHash = hashToken(token);
        String tokenKey = getRefreshTokenKey(tokenHash);

        String employeeId = redisTemplate.opsForValue().get(tokenKey);
        redisTemplate.delete(tokenKey);

        if (employeeId != null) {
            redisTemplate.opsForSet().remove(getUserRefreshTokenSetKey(Long.valueOf(employeeId)), tokenHash);
        }
    }

    @Override
    public void revokeAllTokensForEmployee(Long employeeId) {
        String userSetKey = getUserAccessTokenSetKey(employeeId);
        Set<String> tokenHashes = redisTemplate.opsForSet().members(userSetKey);

        if (tokenHashes != null && !tokenHashes.isEmpty()) {
            for (String tokenHash : tokenHashes) {
                redisTemplate.delete(getAccessTokenKey(tokenHash));
            }
        }

        redisTemplate.delete(userSetKey);
    }

    @Override
    public void revokeAllRefreshTokensForEmployee(Long employeeId) {
        String userSetKey = getUserRefreshTokenSetKey(employeeId);
        Set<String> tokenHashes = redisTemplate.opsForSet().members(userSetKey);

        if (tokenHashes != null && !tokenHashes.isEmpty()) {
            for (String tokenHash : tokenHashes) {
                redisTemplate.delete(getRefreshTokenKey(tokenHash));
            }
        }

        redisTemplate.delete(userSetKey);
    }

    private String getAccessTokenKey(String tokenHash) {
        return ACCESS_PREFIX + tokenHash;
    }

    private String getRefreshTokenKey(String tokenHash) {
        return REFRESH_PREFIX + tokenHash;
    }

    private String getUserAccessTokenSetKey(Long employeeId) {
        return USER_TOKEN_SET_PREFIX + employeeId + USER_ACCESS_TOKEN_SET_SUFFIX;
    }

    private String getUserRefreshTokenSetKey(Long employeeId) {
        return USER_TOKEN_SET_PREFIX + employeeId + USER_REFRESH_TOKEN_SET_SUFFIX;
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);

            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }

            return sb.toString();
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not supported", ex);
        }
    }
}
