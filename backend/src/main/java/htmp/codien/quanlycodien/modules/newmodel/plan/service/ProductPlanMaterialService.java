package htmp.codien.quanlycodien.modules.newmodel.plan.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanResinRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.ProductPlanSupplyRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanResinMapping;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanSupplyMapping;

@Service
public class ProductPlanMaterialService {

    public void replacePlastics(ProductPlan plan, List<ProductPlanResinRequest> plasticDTOs) {
        if (plasticDTOs == null) {
            return;
        }

        List<ProductPlanResinMapping> plastics = plan.getProductPlanResins();
        if (plastics == null) {
            plastics = new ArrayList<>();
            plan.setProductPlanResins(plastics);
        } else {
            plastics.clear();
        }

        for (ProductPlanResinRequest plasticDTO : plasticDTOs) {
            String resinCode = plasticDTO.getResinCode() != null ? plasticDTO.getResinCode().trim() : null;
            if (resinCode == null || resinCode.isEmpty()) {
                throw new ResourceNotFoundException("Mã nhựa không được để trống.");
            }

            ProductPlanResinMapping plastic = ProductPlanResinMapping.builder()
                    .plan(plan)
                    .resinCode(resinCode)
                    .isRecycle(plasticDTO.getIsRecycle())
                    .plasticExpectedWeight(plasticDTO.getPlasticExpectedWeight())
                    .build();
            plastics.add(plastic);
        }
    }

    public void replaceSupplies(ProductPlan plan, List<ProductPlanSupplyRequest> supplyDTOs) {
        if (supplyDTOs == null) {
            return;
        }

        List<ProductPlanSupplyMapping> supplies = plan.getProductPlanSupplies();
        if (supplies == null) {
            supplies = new ArrayList<>();
            plan.setProductPlanSupplies(supplies);
        } else {
            supplies.clear();
        }

        for (ProductPlanSupplyRequest supplyDTO : supplyDTOs) {
            ProductPlanSupplyMapping supply = ProductPlanSupplyMapping.builder()
                    .plan(plan)
                    .supplyCode(supplyDTO.getCode())
                    .supplyName(supplyDTO.getName())
                    .supplyExpectedQuantity(supplyDTO.getSupplyExpectedQuantity())
                    .unit(supplyDTO.getUnit())
                    .remark(supplyDTO.getRemark())
                    .build();
            supplies.add(supply);
        }
    }

}
