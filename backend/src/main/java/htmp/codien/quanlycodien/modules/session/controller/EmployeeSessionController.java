package htmp.codien.quanlycodien.modules.session.controller;

import htmp.codien.quanlycodien.modules.auth.dto.ActiveSessionDTO;
import htmp.codien.quanlycodien.modules.session.service.EmployeeSessionService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class EmployeeSessionController {

    private final EmployeeSessionService sessionService;

    @GetMapping("/active")
    public ResponseEntity<List<ActiveSessionDTO>> getActiveSessions() {
        List<ActiveSessionDTO> activeSessions = sessionService.getActiveSessions();
        return ResponseEntity.ok(activeSessions);
    }

    @DeleteMapping("/employee/{employeeId}")
    public ResponseEntity<?> logoutEmployee(@PathVariable Long employeeId) {
        sessionService.forceLogoutEmployee(
                employeeId,
                "Phiên đăng nhập đã bị quản trị viên kết thúc.",
                "ADMIN_FORCE_LOGOUT");
        return ResponseEntity.ok("Đã logout toàn bộ session của nhân viên " + employeeId);
    }
}