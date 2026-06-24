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
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.ProductPlanApprovalTemplateDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanApprovalTemplateRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.service.ProductPlanApprovalTemplateService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/product-plan-approval-templates")
@RequiredArgsConstructor
public class ProductPlanApprovalTemplateController {

    private final ProductPlanApprovalTemplateService service;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> create(
            @RequestBody ProductPlanApprovalTemplateRequest dto) {
        service.createTemplate(dto);
        return ResponseUtil.success(null, "Tạo template phê duyệt thành công");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductPlanApprovalTemplateDTO>>> getAll() {
        List<ProductPlanApprovalTemplateDTO> templates = service.getAllTemplates();
        return ResponseUtil.success(templates, "Lấy danh sách template phê duyệt thành công");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> update(
            @PathVariable Long id,
            @RequestBody ProductPlanApprovalTemplateRequest req) {
        service.updateTemplate(id, req);
        return ResponseUtil.success(null, "Cập nhật template phê duyệt thành công");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.deleteTemplate(id);
        return ResponseUtil.success(null, "Xóa template phê duyệt thành công");
    }

    //

}