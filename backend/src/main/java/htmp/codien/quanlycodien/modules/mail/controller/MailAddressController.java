package htmp.codien.quanlycodien.modules.mail.controller;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.mail.dto.MailAddressDTO;
import htmp.codien.quanlycodien.modules.mail.service.MailAddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/mail-addresses")
@RequiredArgsConstructor
public class MailAddressController {
    private final MailAddressService mailAddressService;

    @PostMapping
    public ResponseEntity<ApiResponse<MailAddressDTO>> create(@RequestBody MailAddressDTO dto) {
        MailAddressDTO created = mailAddressService.create(dto);
        return ResponseUtil.created(created, "Thêm địa chỉ mail thành công");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MailAddressDTO>>> getAll() {
        List<MailAddressDTO> addresses = mailAddressService.getAll();
        return ResponseUtil.success(addresses, "Lấy danh sách địa chỉ mail thành công");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MailAddressDTO>> getById(@PathVariable Long id) {
        Optional<MailAddressDTO> address = mailAddressService.getById(id);
        return address
                .<ResponseEntity<ApiResponse<MailAddressDTO>>>map(
                        a -> ResponseUtil.success(a, "Lấy địa chỉ mail thành công"))
                .orElseGet(() -> ResponseUtil.notFound("Không tìm thấy địa chỉ mail với ID: " + id));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<MailAddressDTO>> getByEmail(@PathVariable String email) {
        Optional<MailAddressDTO> address = mailAddressService.getByEmail(email);
        return address
                .<ResponseEntity<ApiResponse<MailAddressDTO>>>map(
                        a -> ResponseUtil.success(a, "Lấy địa chỉ mail thành công"))
                .orElseGet(() -> ResponseUtil.notFound("Không tìm thấy địa chỉ mail với email: " + email));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<ApiResponse<List<MailAddressDTO>>> getByDepartmentId(@PathVariable Long departmentId) {
        List<MailAddressDTO> addresses = mailAddressService.getByDepartmentId(departmentId);
        return ResponseUtil.success(addresses, "Lấy danh sách địa chỉ mail theo phòng ban thành công");
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<MailAddressDTO>>> getAllActive() {
        List<MailAddressDTO> addresses = mailAddressService.getAllActive();
        return ResponseUtil.success(addresses, "Lấy danh sách địa chỉ mail hoạt động thành công");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MailAddressDTO>> update(@PathVariable Long id, @RequestBody MailAddressDTO dto) {
        try {
            MailAddressDTO updated = mailAddressService.update(id, dto);
            return ResponseUtil.success(updated, "Cập nhật địa chỉ mail thành công");
        } catch (RuntimeException e) {
            return ResponseUtil.notFound(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            mailAddressService.deleteById(id);
            return ResponseUtil.success(null, "Xóa địa chỉ mail thành công");
        } catch (RuntimeException e) {
            return ResponseUtil.notFound(e.getMessage());
        }
    }

    @GetMapping("/check-email/{email}")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailExists(@PathVariable String email) {
        boolean exists = mailAddressService.existsByEmail(email);
        return ResponseUtil.success(exists, "Kiểm tra email thành công");
    }
}
