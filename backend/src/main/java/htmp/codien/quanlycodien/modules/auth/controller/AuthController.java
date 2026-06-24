package htmp.codien.quanlycodien.modules.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.auth.dto.AuthRequestDTO;
import htmp.codien.quanlycodien.modules.auth.dto.AuthResponseDTO;
import htmp.codien.quanlycodien.modules.auth.dto.ChangePasswordRequest;
import htmp.codien.quanlycodien.modules.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(
            @RequestBody AuthRequestDTO authRequest,
            HttpServletRequest request,
            HttpServletResponse response) {

        AuthResponseDTO authResponse = authService.login(
                authRequest.getCode(),
                authRequest.getPassword(),
                request,
                response);

        return ResponseUtil.success(authResponse, "Đăng nhập thành công");
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> refresh(HttpServletRequest request,
            HttpServletResponse response) {
        AuthResponseDTO authResponse = authService.refresh(request, response);
        return ResponseUtil.success(authResponse, "Refresh token thành công");
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request,
            HttpServletResponse response) {
        authService.logout(request, response);
        return ResponseUtil.success(null, "Đăng xuất thành công");
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@RequestBody ChangePasswordRequest request) {

        authService.changePassword(
                request.getEmployeeId(),
                request.getOldPassword(),
                request.getNewPassword());
        return ResponseUtil.success(null, "Đổi mật khẩu thành công");
    }
}
