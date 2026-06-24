package htmp.codien.quanlycodien.modules.newmodel.plan.controller;

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
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanApproveResultDepartmentDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanApproveResultDepartmentRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.service.ProductPlanApproveResultDepartmentService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mold-trial-plan-approve-result-departments")
public class ProductMoldTrialPlanApproveResultDepartmentController {

    private final ProductPlanApproveResultDepartmentService approveResultDepartmentService;

    @PostMapping

    public ResponseEntity<ApiResponse<Void>> createApproveResultDepartment(
            @RequestBody ProductPlanApproveResultDepartmentRequest request) {
        approveResultDepartmentService.createApproveResultDepartment(request);
        return ResponseUtil.success(null, "Thêm mới phòng ban phê duyệt thành công");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductPlanApproveResultDepartmentDTO>>> getAllApproveResultDepartments() {
        List<ProductPlanApproveResultDepartmentDTO> departments = approveResultDepartmentService
                .getAllApproveResultDepartments();
        return ResponseUtil.success(departments, "Lấy danh sách phòng ban phê duyệt thành công");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductPlanApproveResultDepartmentDTO>> getApproveResultDepartmentById(
            @PathVariable Long id) {
        ProductPlanApproveResultDepartmentDTO department = approveResultDepartmentService
                .getApproveResultDepartmentById(id);
        return ResponseUtil.success(department, "Lấy thông tin phòng ban phê duyệt thành công");
    }

    @PutMapping("/{id}")

    public ResponseEntity<ApiResponse<Void>> updateApproveResultDepartment(
            @PathVariable Long id,
            @RequestBody ProductPlanApproveResultDepartmentRequest request) {
        approveResultDepartmentService.updateApproveResultDepartment(id, request);
        return ResponseUtil.success(null, "Cập nhật phòng ban phê duyệt thành công");
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<ApiResponse<Void>> deleteApproveResultDepartment(@PathVariable Long id) {
        approveResultDepartmentService.deleteApproveResultDepartment(id);
        return ResponseUtil.success(null, "Xóa phòng ban phê duyệt thành công");
    }

    @PostMapping("/create-template")

    public ResponseEntity<ApiResponse<Void>> createTemplateApproveResultDepartments() {
        approveResultDepartmentService.createTemplateApproveResultDepartments();
        return ResponseUtil.success(null, "Tạo template phòng ban phê duyệt thành công");
    }

}
