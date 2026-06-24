package htmp.codien.quanlycodien.infrastructure.config;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.PlanResponse;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductCreationRequest;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductInsertDTO;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductMachineDTO;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductMaterialDTO;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductMoldDepreciationDTO;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductPackingDTO;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductShortResponse;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.Product;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductInsert;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductMachine;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductMaterial;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductMoldDepreciation;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.ProductPacking;

@Configuration
public class ModelMapperConfig {
        @Bean
        public ModelMapper modelMapper() {
                ModelMapper modelMapper = new ModelMapper();

                modelMapper.getConfiguration().setAmbiguityIgnored(true);

                modelMapper.typeMap(ProductCreationRequest.class, Product.class)
                                .addMappings(mapper -> mapper.skip(Product::setId));

                modelMapper.typeMap(Product.class, ProductShortResponse.class)
                                .addMappings(mapper -> {
                                        mapper.map(src -> src.getModel().getId(), ProductShortResponse::setModelId);
                                        mapper.map(src -> src.getModel().getCode(), ProductShortResponse::setModelCode);
                                });

                modelMapper.typeMap(ProductMoldDepreciationDTO.class, ProductMoldDepreciation.class)
                                .addMappings(mapper -> mapper.skip(ProductMoldDepreciation::setId));
                modelMapper.typeMap(ProductMoldDepreciation.class, ProductMoldDepreciationDTO.class)
                                .addMappings(mapper -> {
                                        mapper.map(ProductMoldDepreciation::getId,
                                                        ProductMoldDepreciationDTO::setProductMoldDepreciationId);
                                        mapper.map(ProductMoldDepreciation::getYear,
                                                        ProductMoldDepreciationDTO::setDepreciationYear);
                                        mapper.map(ProductMoldDepreciation::getRemark,
                                                        ProductMoldDepreciationDTO::setDepreciationRemark);
                                });
                modelMapper.typeMap(ProductInsertDTO.class, ProductInsert.class)
                                .addMappings(mapper -> mapper.skip(ProductInsert::setId));
                modelMapper.typeMap(ProductMachineDTO.class, ProductMachine.class)
                                .addMappings(mapper -> mapper.skip(ProductMachine::setId));
                modelMapper.typeMap(ProductPackingDTO.class, ProductPacking.class)
                                .addMappings(mapper -> mapper.skip(ProductPacking::setId));
                modelMapper.typeMap(ProductMaterialDTO.class, ProductMaterial.class)
                                .addMappings(mapper -> mapper.skip(ProductMaterial::setId));

                modelMapper.typeMap(ProductPlan.class, PlanResponse.class)
                                .addMappings(mapper -> {
                                        mapper.skip(PlanResponse::setResponsibleEmployeeId);
                                        mapper.skip(PlanResponse::setResponsibleEmployeeName);
                                        mapper.skip(PlanResponse::setResponsibleEmployeeCode);
                                        mapper.skip(PlanResponse::setApproveResinByEmployeeId);
                                        mapper.skip(PlanResponse::setApproveResinByEmployeeName);
                                        mapper.skip(PlanResponse::setApproveResinByEmployeeCode);
                                        mapper.skip(PlanResponse::setApprovePlanByEmployeeId);
                                        mapper.skip(PlanResponse::setApprovePlanByEmployeeName);
                                        mapper.skip(PlanResponse::setApprovePlanByEmployeeCode);
                                        mapper.skip(PlanResponse::setMoldCode);
                                        mapper.skip(PlanResponse::setOverallApproveResult);

                                        mapper.skip(PlanResponse::setApprovals);
                                });

                return modelMapper;
        }
}
