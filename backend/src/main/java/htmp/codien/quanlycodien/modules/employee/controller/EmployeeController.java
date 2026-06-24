package htmp.codien.quanlycodien.modules.employee.controller;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.common.annotation.RequiresPermission;
import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.modules.employee.dto.EmployeeRequest;
import htmp.codien.quanlycodien.modules.employee.dto.EmployeeResponse;
import htmp.codien.quanlycodien.modules.employee.dto.EmployeeRoleUpdateRequest;
import htmp.codien.quanlycodien.modules.employee.dto.EmployeeSearchRequest;
import htmp.codien.quanlycodien.modules.employee.dto.EmployeeStatsResponse;
import htmp.codien.quanlycodien.modules.employee.dto.EmployeeStatusResponse;
import htmp.codien.quanlycodien.modules.employee.enums.EmployeeStatus;
import htmp.codien.quanlycodien.modules.employee.service.EmployeeService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getAll() {
        List<EmployeeResponse> employees = employeeService.findAll();
        return ResponseUtil.success(employees, "Lấy danh sách nhân viên thành công");
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getMe() {
        EmployeeResponse employee = employeeService.getMe();
        return ResponseUtil.success(employee, "Lấy thông tin nhân viên thành công");
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<EmployeeStatsResponse>> getEmployeeStats() {
        EmployeeStatsResponse stats = employeeService.getEmployeeStats();
        return ResponseUtil.success(stats, "Lấy thống kê nhân viên thành công");
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> searchEmployees(
            @RequestBody EmployeeSearchRequest searchRequest) {
        List<EmployeeResponse> employees = employeeService.searchEmployees(searchRequest);
        return ResponseUtil.success(employees, "Tìm kiếm nhân viên thành công");
    }

    @PostMapping("/search/page")
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<EmployeeResponse>>> searchEmployeesWithPagination(
            @RequestBody EmployeeSearchRequest searchRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        org.springframework.data.domain.Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC")
                ? org.springframework.data.domain.Sort.Direction.DESC
                : org.springframework.data.domain.Sort.Direction.ASC;

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by(direction, sortBy));

        org.springframework.data.domain.Page<EmployeeResponse> employeePage = employeeService
                .searchEmployeesWithPagination(searchRequest, pageable);

        return ResponseUtil.success(employeePage, "Tìm kiếm nhân viên có phân trang thành công");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getById(@PathVariable Long id) {
        EmployeeResponse employee = employeeService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return ResponseUtil.success(employee, "Lấy nhân viên thành công");
    }

    @GetMapping("/code")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getByCode(@RequestParam String code) {
        EmployeeResponse res = employeeService.getEmployeeByCode(code);
        return ResponseUtil.success(res, "Lấy nhân viên với mã " + code + " thành công");
    }

    @GetMapping("/department")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getByDepartment(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String departmentCode) {
        if (departmentCode == null && departmentId == null) {
            return ResponseUtil.serverError("Bạn cần truyền ID hoặc mã phòng ban");
        }
        List<EmployeeResponse> employees;
        if (departmentId != null) {
            employees = employeeService.findByDepartment(departmentId);
        } else {
            employees = employeeService.findByDepartmentCode(departmentCode);
        }
        return ResponseUtil.success(employees, "Lấy danh sách nhân viên theo phòng ban thành công");
    }

    @PostMapping
    @RequiresPermission("EMPLOYEE_CREATE")
    public ResponseEntity<ApiResponse<Void>> create(@RequestBody EmployeeRequest dto) {
        employeeService.save(dto);
        return ResponseUtil.success(null, "Tạo nhân viên thành công");
    }

    @PatchMapping("/{id}")
    @RequiresPermission("EMPLOYEE_UPDATE")
    public ResponseEntity<ApiResponse<Void>> update(@PathVariable Long id, @RequestBody EmployeeRequest dto) {
        employeeService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        dto.setId(id);
        employeeService.save(dto);
        return ResponseUtil.success(null, "Cập nhật nhân viên thành công");
    }

    @PatchMapping("/{id}/role")
    @RequiresPermission("EMPLOYEE_UPDATE")
    public ResponseEntity<ApiResponse<Void>> updateRole(
            @PathVariable Long id,
            @RequestBody EmployeeRoleUpdateRequest request) {

        if (!SecurityUtils.hasRole(Role.SUPERADMIN)) {
            return ResponseUtil.forbidden("Bạn không có quyền thay đổi vai trò nhân viên");
        }
        if (request == null || request.getRole() == null) {
            return ResponseUtil.badRequest("Thiếu thông tin vai trò cần cập nhật");
        }
        employeeService.updateRole(id, request.getRole());
        return ResponseUtil.success(null, "Cập nhật vai trò nhân viên thành công");
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@PathVariable Long id) {
        if (!SecurityUtils.hasRole(Role.SUPERADMIN)) {
            return ResponseUtil.forbidden("Chỉ SUPERADMIN mới được reset mật khẩu nhân viên");
        }

        employeeService.resetPassword(id);
        return ResponseUtil.success(null, "Đã reset mật khẩu nhân viên về mặc định Htmp1234");
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<EmployeeStatusResponse>>> getAllEmployeeRole() {
        List<EmployeeStatusResponse> roleList = Arrays.stream(EmployeeStatus.values())
                .map(role -> new EmployeeStatusResponse(role.name(), role.getDescription()))
                .collect(Collectors.toList());
        return ResponseUtil.success(roleList, "Lấy danh sách vai trò thành công");
    }

    @PostMapping("/import")
    public ResponseEntity<ApiResponse<Void>> importFromExcel(@RequestParam("file") MultipartFile file) {
        employeeService.importEmployeeFromExcel(file);
        return ResponseUtil.success(null, "Nhập nhân viên từ Excel thành công");
    }

    @PostMapping("/sync")
    @RequiresPermission("EMPLOYEE_SYNC")
    public ResponseEntity<ApiResponse<Void>> syncEmployeeData() {
        employeeService.syncEmployeeData();
        return ResponseUtil.success(null, "Đồng bộ dữ liệu nhân viên thành công");
    }

}