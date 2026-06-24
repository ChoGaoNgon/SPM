package htmp.codien.quanlycodien.modules.auth.service;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.infrastructure.realtime.RealtimeService;
import htmp.codien.quanlycodien.infrastructure.security.JwtTokenProvider;
import htmp.codien.quanlycodien.modules.auth.dto.AuthResponseDTO;
import htmp.codien.quanlycodien.modules.employee.dto.EmployeeResponse;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.employee.service.EmployeeService;
import htmp.codien.quanlycodien.modules.permission.service.PermissionService;
import htmp.codien.quanlycodien.modules.session.repository.EmployeeSessionRepository;
import htmp.codien.quanlycodien.modules.session.service.EmployeeSessionService;
import htmp.codien.quanlycodien.modules.session.service.TokenStoreService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeRepository employeeRepository;
    private final PermissionService permissionService;
    private final EmployeeSessionService employeeSessionService;
    private final EmployeeSessionRepository sessionRepository;
    private final TokenStoreService tokenStoreService;
    private final EmployeeService employeeService;
    private final RealtimeService realtimeService;

    @Value("${jwt.expirationMs}")
    private long jwtExpirationMs;

    @Value("${jwt.refreshExpirationMs:604800000}")
    private long jwtRefreshExpirationMs;

    @Override
    public AuthResponseDTO login(String code, String password, HttpServletRequest request,
            HttpServletResponse response) {
        Employee user = employeeRepository.findByCode(code)
                .orElseThrow(() -> new UsernameNotFoundException("Mã nhân viên không tồn tại"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException("Mật khẩu không đúng");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getCode(), user.getRole().toString());

        Duration accessTokenTtl = Duration.ofMillis(jwtExpirationMs);
        Duration refreshTokenTtl = Duration.ofMillis(jwtRefreshExpirationMs);
        tokenStoreService.revokeAllTokensForEmployee(user.getId());
        tokenStoreService.revokeAllRefreshTokensForEmployee(user.getId());
        tokenStoreService.saveToken(user.getId(), accessToken, accessTokenTtl);
        tokenStoreService.saveRefreshToken(user.getId(), refreshToken, refreshTokenTtl);

        String deviceInfo = request.getHeader("User-Agent");

        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null) {
            ipAddress = request.getRemoteAddr();
        }

        ResponseCookie accessCookie = buildAccessTokenCookie(accessToken, request, accessTokenTtl);
        ResponseCookie refreshCookie = buildRefreshTokenCookie(refreshToken, request, refreshTokenTtl);
        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        employeeSessionService.createSession(user, accessToken, deviceInfo, ipAddress, refreshTokenTtl);

        EmployeeResponse userDto = employeeService.toResponse(user);

        var permissions = permissionService.getPermissionsForEmployee(user.getId());

        return new AuthResponseDTO(accessToken, userDto, permissions, false);
    }

    @Override
    public AuthResponseDTO refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = extractRefreshTokenFromRequest(request);
        if (refreshToken == null) {
            throw new CredentialsExpiredException("Không tìm thấy refresh token");
        }

        if (!jwtTokenProvider.validateToken(refreshToken)
                || !jwtTokenProvider.isRefreshToken(refreshToken)
                || !tokenStoreService.isRefreshTokenActive(refreshToken)) {
            clearAuthCookies(request, response);
            throw new CredentialsExpiredException("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        String code = jwtTokenProvider.getCodeFromJWT(refreshToken);
        Employee user = employeeRepository.findByCode(code)
                .orElseThrow(() -> new UsernameNotFoundException("Mã nhân viên không tồn tại"));

        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getCode(), user.getRole().toString());

        Duration accessTokenTtl = Duration.ofMillis(jwtExpirationMs);
        Duration refreshTokenTtl = Duration.ofMillis(jwtRefreshExpirationMs);

        tokenStoreService.revokeRefreshToken(refreshToken);
        tokenStoreService.saveRefreshToken(user.getId(), newRefreshToken, refreshTokenTtl);
        tokenStoreService.saveToken(user.getId(), newAccessToken, accessTokenTtl);

        ResponseCookie accessCookie = buildAccessTokenCookie(newAccessToken, request, accessTokenTtl);
        ResponseCookie refreshCookie = buildRefreshTokenCookie(newRefreshToken, request, refreshTokenTtl);
        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        EmployeeResponse userDto = employeeService.toResponse(user);
        var permissions = permissionService.getPermissionsForEmployee(user.getId());

        return new AuthResponseDTO(newAccessToken, userDto, permissions, false);
    }

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        String accessToken = extractAccessTokenFromRequest(request);

        Long employeeId = null;
        if (accessToken != null) {
            try {
                String code = jwtTokenProvider.getCodeFromJWT(accessToken);
                Employee employee = employeeRepository.findByCode(code).orElse(null);
                if (employee != null) {
                    employeeId = employee.getId();
                }
            } catch (Exception e) {

            }
            tokenStoreService.revokeToken(accessToken);
        }

        String refreshToken = extractRefreshTokenFromRequest(request);
        if (refreshToken != null) {
            tokenStoreService.revokeRefreshToken(refreshToken);
        }

        if (employeeId != null) {
            tokenStoreService.revokeAllTokensForEmployee(employeeId);
            tokenStoreService.revokeAllRefreshTokensForEmployee(employeeId);

            sessionRepository.findByEmployeeIdAndActiveTrue(employeeId)
                    .forEach(s -> {
                        s.setActive(false);
                        sessionRepository.save(s);
                    });
        }

        clearAuthCookies(request, response);

        realtimeService.forceLogout(employeeId, "Bạn đã bị đăng xuất");
    }

    @Override
    public void changePassword(Long employeeId, String oldPassword, String newPassword) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại"));

        if (!passwordEncoder.matches(oldPassword, employee.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không đúng");
        }

        employee.setPassword(passwordEncoder.encode(newPassword));
        employeeRepository.save(employee);
    }

    private String extractAccessTokenFromRequest(HttpServletRequest request) {
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (jakarta.servlet.http.Cookie cookie : cookies) {
                if ("access_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }

    private String extractRefreshTokenFromRequest(HttpServletRequest request) {
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (jakarta.servlet.http.Cookie cookie : cookies) {
                if ("refresh_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        return null;
    }

    private ResponseCookie buildAccessTokenCookie(String token, HttpServletRequest request, Duration maxAge) {
        String requestUrl = request.getRequestURL().toString();
        boolean isProduction = requestUrl.contains("htmp.vn");
        boolean isHttps = request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));

        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie.from("access_token", token)
                .httpOnly(true)
                .path("/")
                .maxAge(maxAge);

        if (isProduction) {
            cookieBuilder
                    .secure(true)
                    .sameSite("None")
                    .domain(".htmp.vn");
        } else {

            cookieBuilder
                    .secure(isHttps)
                    .sameSite(isHttps ? "None" : "Lax");
        }

        return cookieBuilder.build();
    }

    private ResponseCookie buildRefreshTokenCookie(String token, HttpServletRequest request, Duration maxAge) {
        String requestUrl = request.getRequestURL().toString();
        boolean isProduction = requestUrl.contains("htmp.vn");
        boolean isHttps = request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));

        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie.from("refresh_token", token)
                .httpOnly(true)
                .path("/")
                .maxAge(maxAge);

        if (isProduction) {
            cookieBuilder
                    .secure(true)
                    .sameSite("None")
                    .domain(".htmp.vn");
        } else {
            cookieBuilder
                    .secure(isHttps)
                    .sameSite(isHttps ? "None" : "Lax");
        }

        return cookieBuilder.build();
    }

    private void clearAuthCookies(HttpServletRequest request, HttpServletResponse response) {
        ResponseCookie deleteAccessCookie = buildAccessTokenCookie("", request, Duration.ZERO);
        ResponseCookie deleteRefreshCookie = buildRefreshTokenCookie("", request, Duration.ZERO);
        response.addHeader(HttpHeaders.SET_COOKIE, deleteAccessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, deleteRefreshCookie.toString());
    }
}
