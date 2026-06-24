package htmp.codien.quanlycodien.modules.workschedule.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.workschedule.dto.schedule.DepartmentLockDTO;
import htmp.codien.quanlycodien.modules.workschedule.service.lockshedule.DepartmentScheduleLockService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/department-schedule-lock")
@RequiredArgsConstructor
public class DepartmentScheduleLockController {

    private final DepartmentScheduleLockService lockService;

    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Boolean>> checkLock(
            @RequestParam Long departmentId,
            @RequestParam int year,
            @RequestParam int month) {
        boolean locked = lockService.isLocked(departmentId, year, month);
        return ResponseUtil.success(locked, "Trạng thái khóa lịch");
    }

    @PostMapping("/lock")
    public ResponseEntity<ApiResponse<Void>> lock(
            @RequestParam Long departmentId,
            @RequestParam int year,
            @RequestParam int month) {
        lockService.lockSchedule(departmentId, year, month);
        return ResponseUtil.success(null, "Đã khóa lịch thành công");
    }

    @PostMapping("/unlock")
    public ResponseEntity<ApiResponse<Void>> unlock(
            @RequestParam Long departmentId,
            @RequestParam int year,
            @RequestParam int month) {
        lockService.unlockSchedule(departmentId, year, month);
        return ResponseUtil.success(null, "Đã mở khóa lịch thành công");
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<DepartmentLockDTO>>> list(
            @RequestParam int year,
            @RequestParam int month) {
        List<DepartmentLockDTO> list = lockService.getDepartmentsWithLockStatus(year, month);
        return ResponseUtil.success(list, "Danh sách phòng với trạng thái khóa");
    }

    @PostMapping("/lock-multiple")
    public ResponseEntity<ApiResponse<Void>> lockMultiple(
            @RequestBody List<Long> departmentIds,
            @RequestParam int year,
            @RequestParam int month) {
        lockService.lockDepartments(departmentIds, year, month);
        return ResponseUtil.success(null, "Đã khóa các phòng thành công");
    }

    @PostMapping("/unlock-multiple")
    public ResponseEntity<ApiResponse<Void>> unlockMultiple(
            @RequestBody List<Long> departmentIds,
            @RequestParam int year,
            @RequestParam int month) {
        lockService.unlockDepartments(departmentIds, year, month);
        return ResponseUtil.success(null, "Đã mở khóa các phòng thành công");
    }
}
