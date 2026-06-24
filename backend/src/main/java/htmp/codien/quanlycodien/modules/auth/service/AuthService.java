package htmp.codien.quanlycodien.modules.auth.service;

import htmp.codien.quanlycodien.modules.auth.dto.AuthResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {
    AuthResponseDTO login(String code, String password, HttpServletRequest request, HttpServletResponse response);

    AuthResponseDTO refresh(HttpServletRequest request, HttpServletResponse response);

    void logout(HttpServletRequest request, HttpServletResponse response);

    void changePassword(Long employeeId, String oldPassword, String newPassword);

}
