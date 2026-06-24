package htmp.codien.quanlycodien.modules.workschedule.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.ShiftDTO;
import htmp.codien.quanlycodien.modules.workschedule.service.shift.ShiftService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/shifts")
@RequiredArgsConstructor
public class ShiftController {
    private final ShiftService shiftService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShiftDTO>>> getAllShifts() {
        List<ShiftDTO> shifts = shiftService.getAllShifts();
        return ResponseUtil.success(shifts, "Lấy danh sách ca làm việc thành công");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShiftDTO>> getShiftById(@PathVariable Long id) {
        ShiftDTO shift = shiftService.getShiftById(id);
        return ResponseUtil.success(shift, "Lấy thông tin ca làm việc thành công");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> addShift(@RequestBody ShiftDTO shiftDTO) {
        shiftService.addShift(shiftDTO);
        return ResponseUtil.success(null, "Thêm ca làm việc thành công");
    }

    @PostMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updateShift(@PathVariable Long id, @RequestBody ShiftDTO shiftDTO) {
        shiftService.updateShift(id, shiftDTO);
        return ResponseUtil.success(null, "Cập nhật ca làm việc thành công");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteShift(@PathVariable Long id) {
        shiftService.deleteShift(id);
        return ResponseUtil.success(null, "Xóa ca làm việc thành công");
    }
}