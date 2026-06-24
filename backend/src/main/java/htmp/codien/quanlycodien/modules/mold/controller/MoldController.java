package htmp.codien.quanlycodien.modules.mold.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.mold.dto.MoldIssueResponse;
import htmp.codien.quanlycodien.modules.mold.dto.MoldRequest;
import htmp.codien.quanlycodien.modules.mold.dto.MoldResponse;
import htmp.codien.quanlycodien.modules.mold.service.MoldService;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.MoldDevelopmentByCustomerProjection;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.MoldIssueStatisticsProjection;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/molds")
@RequiredArgsConstructor
public class MoldController {
    private final MoldService moldService;

    @GetMapping()
    public ResponseEntity<ApiResponse<List<MoldResponse>>> getAllMolds() {
        List<MoldResponse> results = moldService.getAllMolds();
        return ResponseUtil.success(results, "Lấy danh sách khuôn thành công");
    }

    @PostMapping()
    public ResponseEntity<ApiResponse<Void>> createMold(@RequestBody MoldRequest moldRequest) {
        moldService.create(moldRequest);
        return ResponseUtil.success(null, "Tạo mới khuôn thành công");
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<ApiResponse<Void>> updateMold(
            @PathVariable Long id,
            @RequestBody MoldRequest moldRequest) {
        moldService.update(id, moldRequest);
        return ResponseUtil.success(null, "Cập nhật khuôn thành công");
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<MoldResponse>> getMoldByCode(@PathVariable String code) {
        MoldResponse moldResponse = moldService.getMoldByCode(code);
        return ResponseUtil.success(moldResponse, "Lấy khuôn theo mã thành công");
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<ApiResponse<MoldResponse>> getMoldByID(@PathVariable Long id) {
        MoldResponse moldResponse = moldService.getMoldByID(id);
        return ResponseUtil.success(moldResponse, "Lấy khuôn theo ID thành công");
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<MoldResponse>>> searchMolds(@RequestParam(required = false) String keyword) {
        List<MoldResponse> results = moldService.searchMoldSpecification(keyword);
        return ResponseUtil.success(results, "Tìm kiếm khuôn thành công");
    }

    @GetMapping("/issue-statistics")
    public ResponseEntity<ApiResponse<List<MoldIssueStatisticsProjection>>> getMoldIssueStatistics(
            @RequestParam(defaultValue = "5") Integer limit) {
        List<MoldIssueStatisticsProjection> results = moldService.getMoldIssueStatistics(limit);
        return ResponseUtil.success(results, "Lấy thống kê lỗi khuôn thành công");
    }

    @GetMapping("/developing-by-customer")
    public ResponseEntity<ApiResponse<List<MoldDevelopmentByCustomerProjection>>> getDevelopingMoldStatisticsByCustomer() {
        List<MoldDevelopmentByCustomerProjection> results = moldService.getDevelopingMoldStatisticsByCustomer();
        return ResponseUtil.success(results, "Lấy thống kê số khuôn đang phát triển theo khách hàng thành công");
    }

    @GetMapping("/{id:\\d+}/issues")
    public ResponseEntity<ApiResponse<List<MoldIssueResponse>>> getMoldIssues(@PathVariable Long id) {
        List<MoldIssueResponse> results = moldService.getMoldIssues(id);
        return ResponseUtil.success(results, "Lấy vấn đề phát sinh khi thử khuôn thành công");
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<ApiResponse<Void>> deleteMold(@PathVariable Long id) {
        moldService.delete(id);
        return ResponseUtil.success(null, "Xóa khuôn thành công");
    }

}
