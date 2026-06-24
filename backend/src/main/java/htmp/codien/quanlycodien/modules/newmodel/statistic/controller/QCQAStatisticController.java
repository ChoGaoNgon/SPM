package htmp.codien.quanlycodien.modules.newmodel.statistic.controller;

import java.util.List;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PendingSampleReceiptDto;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.QcqaApprovalPendingDto;
import htmp.codien.quanlycodien.modules.newmodel.statistic.service.qac.QcqaStatisticService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/qcqa/statistics")
@RequiredArgsConstructor
public class QCQAStatisticController {

    private final QcqaStatisticService qcqaStatisticService;

    @GetMapping("/pending-sample-receipt")
    public ResponseEntity<ApiResponse<List<PendingSampleReceiptDto>>> getPendingSampleReceipts() {
        List<PendingSampleReceiptDto> response = qcqaStatisticService.getPendingSampleReceipts();
        return ResponseUtil.success(response, "Lấy thống kê phiếu nhận mẫu chờ tiếp nhận thành công");
    }   

    @GetMapping("/approval-pending")
    public ResponseEntity<ApiResponse<List<QcqaApprovalPendingDto>>> getPlanInspectionApprovalPending(
            @RequestParam(required = false, defaultValue = "") String param) {
        List<QcqaApprovalPendingDto> response = qcqaStatisticService.getPlanInspectionApprovalPending(param);
        return ResponseUtil.success(response, "Lấy thống kê phê duyệt kế hoạch kiểm tra thành công");
    }

}
