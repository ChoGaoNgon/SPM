package htmp.codien.quanlycodien.modules.workschedule.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.ShiftBreakDTO;
import htmp.codien.quanlycodien.modules.workschedule.service.shiftbreak.ShiftBreakService;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/shift-breaks")
@RequiredArgsConstructor
public class ShiftBreakController {
    private final ShiftBreakService shiftBreakService;

    @GetMapping("/break-types")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getBreakTypes() {
        List<Map<String, String>> breakTypes = Arrays
                .stream(htmp.codien.quanlycodien.modules.workschedule.enums.BreakType.values())
                .map(bt -> Map.of(
                        "name", bt.name(),
                        "description", bt.getDescription()))
                .toList();

        return ResponseUtil.success(breakTypes, "Lấy danh sách loại ca nghỉ thành công");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShiftBreakDTO>>> getAllShifts() {
        List<ShiftBreakDTO> shifts = shiftBreakService.getAllShiftBreaks();
        return ResponseUtil.success(shifts, "Lấy danh sách ca nghỉ thành công");
    }

    @GetMapping("/by-shift/{shiftId}")
    public ResponseEntity<ApiResponse<List<ShiftBreakDTO>>> getAllShiftsByShiftId(@PathVariable Long shiftId) {
        List<ShiftBreakDTO> shifts = shiftBreakService.getAllShiftBreaksByShiftId(shiftId);
        return ResponseUtil.success(shifts, "Lấy danh sách ca nghỉ theo shiftId thành công");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShiftBreakDTO>> getShiftById(@PathVariable Long id) {
        ShiftBreakDTO shift = shiftBreakService.getShiftBreakById(id);
        return ResponseUtil.success(shift, "Lấy thông tin ca nghỉ thành công");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> addShift(@RequestBody ShiftBreakDTO shiftBreakDTO) {
        shiftBreakService.createShiftBreak(shiftBreakDTO);
        return ResponseUtil.success(null, "Thêm ca nghỉ thành công");
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updateShift(@PathVariable Long id,
            @RequestBody ShiftBreakDTO shiftBreakDTO) {
        shiftBreakService.updateShiftBreak(id, shiftBreakDTO);
        return ResponseUtil.success(null, "Cập nhật ca nghỉ thành công");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteShift(@PathVariable Long id) {
        shiftBreakService.deleteShiftBreak(id);
        return ResponseUtil.success(null, "Xóa ca nghỉ thành công");
    }
}