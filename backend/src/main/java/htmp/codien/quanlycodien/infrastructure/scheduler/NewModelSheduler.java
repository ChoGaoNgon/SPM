package htmp.codien.quanlycodien.infrastructure.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import htmp.codien.quanlycodien.modules.newmodel.plan.service.ProductDefectCodeService;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NewModelSheduler {
    private final ProductDefectCodeService productDefectCodeService;

    @Scheduled(cron = "0 00 00 * * ?")
    public void runSyncDefectCodeJob() {
        productDefectCodeService.syncDefects();
    }
}