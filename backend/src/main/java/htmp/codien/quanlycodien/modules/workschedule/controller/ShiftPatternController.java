package htmp.codien.quanlycodien.modules.workschedule.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.ShiftPatternDTO;
import htmp.codien.quanlycodien.modules.workschedule.service.shiftpattern.ShiftPatternService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/shift-patterns")
@RequiredArgsConstructor
public class ShiftPatternController {

    private final ShiftPatternService shiftPatternService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShiftPatternDTO>>> getAllShiftPatterns() {
        List<ShiftPatternDTO> shiftPatterns = shiftPatternService.getAllShiftPatterns();
        return ResponseUtil.success(shiftPatterns, "Lấy danh sách mẫu ca thành công");
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ShiftPatternDTO>>> getActiveShiftPatterns() {
        List<ShiftPatternDTO> shiftPatterns = shiftPatternService.getActiveShiftPatterns();
        return ResponseUtil.success(shiftPatterns, "Lấy danh sách mẫu ca đang hoạt động thành công");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShiftPatternDTO>> getShiftPatternById(@PathVariable Long id) {
        ShiftPatternDTO shiftPattern = shiftPatternService.getShiftPatternById(id);
        return ResponseUtil.success(shiftPattern, "Lấy thông tin mẫu ca thành công");
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<ShiftPatternDTO>> getShiftPatternByCode(@PathVariable String code) {
        ShiftPatternDTO shiftPattern = shiftPatternService.getShiftPatternByCode(code);
        return ResponseUtil.success(shiftPattern, "Lấy thông tin mẫu ca thành công");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> addShiftPattern(@RequestBody ShiftPatternDTO shiftPatternDTO) {
        shiftPatternService.addShiftPattern(shiftPatternDTO);
        return ResponseUtil.success(null, "Thêm mẫu ca thành công");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updateShiftPattern(
            @PathVariable Long id,
            @RequestBody ShiftPatternDTO shiftPatternDTO) {
        shiftPatternService.updateShiftPattern(id, shiftPatternDTO);
        return ResponseUtil.success(null, "Cập nhật mẫu ca thành công");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteShiftPattern(@PathVariable Long id) {
        shiftPatternService.deleteShiftPattern(id);
        return ResponseUtil.success(null, "Xóa mẫu ca thành công");
    }

    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<ApiResponse<Void>> toggleActiveStatus(@PathVariable Long id) {
        shiftPatternService.toggleActiveStatus(id);
        return ResponseUtil.success(null, "Thay đổi trạng thái thành công");
    }
}
