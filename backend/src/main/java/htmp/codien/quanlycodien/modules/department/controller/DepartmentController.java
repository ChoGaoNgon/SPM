package htmp.codien.quanlycodien.modules.department.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.common.annotation.RequiresPermission;
import htmp.codien.quanlycodien.modules.department.dto.DepartmentRequest;
import htmp.codien.quanlycodien.modules.department.dto.DepartmentRootDTO;
import htmp.codien.quanlycodien.modules.department.entity.Department;
import htmp.codien.quanlycodien.modules.department.service.DepartmentService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {
    private final DepartmentService departmentService;

    @GetMapping("/{departmentId}")
    public ResponseEntity<ApiResponse<Department>> getDepartmentById(@PathVariable Long departmentId) {
        Department department = departmentService.getDepartmentById(departmentId);
        return ResponseUtil.success(department, "Lấy thông tin phòng ban thành công");
    }

    @GetMapping("/root")
    public ResponseEntity<ApiResponse<List<DepartmentRootDTO>>> getRootDepartments() {
        List<DepartmentRootDTO> rootDepartments = departmentService.getRootDepartments();
        return ResponseUtil.success(rootDepartments, "Lấy danh sách phòng ban gốc thành công");
    }

    @GetMapping("/sub")
    public ResponseEntity<ApiResponse<List<Department>>> getSubDepartments(@RequestParam Long parentId) {
        List<Department> subDepartments = departmentService.getSubDepartments(parentId);
        return ResponseUtil.success(subDepartments, "Lấy danh sách bộ phận thành công");
    }

    @PostMapping("")
    @RequiresPermission("DEPARTMENT_CREATE")
    public ResponseEntity<ApiResponse<Void>> createDepartment(@RequestBody DepartmentRequest request) {
        departmentService.createDepartment(request);
        return ResponseUtil.success(null, "Tạo phòng ban thành công");
    }

    @PatchMapping("/{id}")
    @RequiresPermission("DEPARTMENT_UPDATE")
    public ResponseEntity<ApiResponse<Void>> updateDepartment(
            @PathVariable Long id,
            @RequestBody DepartmentRequest department) {
        departmentService.updateDepartment(id, department);
        return ResponseUtil.success(null, "Cập nhật phòng ban thành công");
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("DEPARTMENT_DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseUtil.success(null, "Xóa phòng ban thành công");
    }
}
