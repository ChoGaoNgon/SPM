package htmp.codien.quanlycodien.modules.newmodel.product.service;

import java.util.List;
import java.util.Map;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.infrastructure.storage.FileStorageService;
import htmp.codien.quanlycodien.modules.newmodel.mp.service.ProductMpCheckListService;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanInspection;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanIssue;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductDeliveryRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductFaInspectionRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanApprovalRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanApproveResultRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanDelayLogRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanIssueDefectCodeRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanIssueFileRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanIssueRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanSupplyMappingRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.Product;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductHistoryRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductInsertRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductMachineRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductMaterialRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductMoldDepreciationRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductPackingRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductPlanPlasticRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductPlanResinMappingRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductResinMappingRepository;
import htmp.codien.quanlycodien.modules.newmodel.productModel.entity.Model;
import htmp.codien.quanlycodien.modules.newmodel.productionLot.repository.ProductionLotDefectCodeRepository;
import htmp.codien.quanlycodien.modules.newmodel.productionLot.repository.ProductionLotRepository;
import htmp.codien.quanlycodien.modules.notification.enums.NotificationEvent;
import htmp.codien.quanlycodien.modules.notification.service.NotificationTriggerEvent;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductDeletorService {
    private final ProductResinMappingRepository ProductResinMappingRepository;

    private final ProductRepository productRepository;
    private final ProductHistoryRepository productHistoryRepository;
    private final ProductPackingRepository productPackingRepository;
    private final ProductMachineRepository productMachineRepository;
    private final ProductMoldDepreciationRepository productMoldDepreciationRepository;
    private final ProductInsertRepository productInsertRepository;
    private final ProductMaterialRepository productMaterialRepository;

    private final ProductPlanRepository productPlanRepository;
    private final ProductFaInspectionRepository productFaInspectionRepository;
    private final ProductDeliveryRepository productDeliveryRepository;
    private final ProductPlanIssueRepository productPlanIssueRepository;
    private final ProductPlanIssueFileRepository productPlanIssueFileRepository;
    private final ProductPlanIssueDefectCodeRepository productPlanIssueDefectCodeRepository;
    private final ProductPlanPlasticRepository productPlanPlasticRepository;
    private final ProductPlanApproveResultRepository productPlanApproveResultRepository;
    private final ProductPlanApprovalRepository productPlanApprovalRepository;
    private final ProductPlanDelayLogRepository productPlanDelayLogRepository;
    private final ProductPlanSupplyMappingRepository productPlanSupplyMappingRepository;
    private final ProductPlanResinMappingRepository productPlanResinMappingRepository;
    private final ProductionLotDefectCodeRepository productionLotDefectCodeRepository;
    private final ProductionLotRepository productionLotRepository;

    private final ProductMpCheckListService productMpCheckListService;
    private final FileStorageService fileStorageService;
    private final EntityManager entityManager;
    private final ApplicationEventPublisher applicationEventPublisher;

    public void deleteAllByModel(Model model) {
        List<Product> products = productRepository.findByModel(model);
        if (products.isEmpty())
            return;

        for (Product product : products) {
            deleteOne(product);
        }

    }

    public void deleteOne(Product product) {
        String folderPath = "models/" + product.getModel().getCode() + "/" + product.getCode();
        Long productId = product.getId();

        ProductResinMappingRepository.deleteAll(ProductResinMappingRepository.findByProductId(productId));

        productHistoryRepository.deleteByProduct_Id(productId);

        productPackingRepository.deleteByProductId(productId);
        productMachineRepository.deleteByProductId(productId);
        productMoldDepreciationRepository.deleteByProductId(productId);
        productInsertRepository.deleteByProductId(productId);
        productMaterialRepository.deleteByProductId(productId);
        deleteProducPlanHasDependency(product);
        productMpCheckListService.deleteByProductId(productId);

        entityManager.flush();
        entityManager.clear();

        productRepository.findById(productId).ifPresent(managedProduct -> {
            productRepository.delete(managedProduct);
        });

        productRepository.flush();
        fileStorageService.deleteFolder(folderPath);

        var current = SecurityUtils.getCurrentEmployee();
        applicationEventPublisher.publishEvent(
                new NotificationTriggerEvent(
                        NotificationEvent.PRODUCT_DELETED,
                        Map.of(
                                "modelId", product.getModel().getId(),
                                "modelCode", product.getModel().getCode(),
                                "productId", product.getId(),
                                "productCode", product.getCode(),
                                "employeeCode", current != null ? current.getCode() : "SYSTEM",
                                "employeeName", current != null ? current.getName() : "SYSTEM")));
    }

    public void deleteSinglePlanWithDependencies(ProductPlan plan) {
        Long planId = plan.getId();

        List<ProductPlanIssue> issueList = plan.getIssues();
        for (ProductPlanIssue issue : issueList) {
            productPlanIssueFileRepository.deleteAllByIssueId(issue.getId());
        }

        productPlanIssueDefectCodeRepository.deleteByPlanId(planId);
        productPlanIssueRepository.deleteAllByPlanId(planId);


        productInsertRepository.deleteByPlanId(planId);
        productPlanDelayLogRepository.deleteByPlan_Id(planId);
        productPlanSupplyMappingRepository.deleteByPlan_Id(planId);
        productPlanResinMappingRepository.deleteByPlanId(planId);

        entityManager.flush();

        if (plan.getInspections() != null) {
            ProductPlanInspection inspection = plan.getInspections();

            productDeliveryRepository.deleteByInspectionId(inspection.getId());
            entityManager.flush();

            if (!entityManager.contains(inspection)) {
                inspection = entityManager.merge(inspection);
            }

            plan.setInspections(null);
            entityManager.remove(inspection);
            entityManager.flush();
        }

        productFaInspectionRepository.deleteAllByPlanId(planId);
        productPlanPlasticRepository.deleteByPlanId(planId);
        productPlanPlasticRepository.deleteLegacyByPlanId(planId);
        productPlanApproveResultRepository.deleteByPlanId(planId);
        productPlanApprovalRepository.deleteByPlanId(planId);
        productionLotDefectCodeRepository.deleteByPlanId(planId);
        productionLotRepository.deleteByPlanId(planId);


        entityManager.flush();
        entityManager.clear();
        productPlanRepository.deleteByPlanId(planId);
        entityManager.flush();
    }

    private void deleteProducPlanHasDependency(Product product) {
        List<ProductPlan> pMoldTrialPlans = productPlanRepository.findByProduct_Id(product.getId());
        for (ProductPlan pMoldTrialPlan : pMoldTrialPlans) {

            deleteSinglePlanWithDependencies(pMoldTrialPlan);
        }
    }
}
