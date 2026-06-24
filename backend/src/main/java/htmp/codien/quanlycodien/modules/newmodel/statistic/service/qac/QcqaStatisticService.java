package htmp.codien.quanlycodien.modules.newmodel.statistic.service.qac;

import java.util.List;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PendingSampleReceiptDto;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.QcqaApprovalPendingDto;

public interface QcqaStatisticService {

    List<QcqaApprovalPendingDto> getPlanInspectionApprovalPending(String param);

    List<PendingSampleReceiptDto> getPendingSampleReceipts();

}
