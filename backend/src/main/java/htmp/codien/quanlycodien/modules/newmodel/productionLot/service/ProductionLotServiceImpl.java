package htmp.codien.quanlycodien.modules.newmodel.productionLot.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductDefectCode;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductDefectCodeRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanRepository;
import htmp.codien.quanlycodien.modules.newmodel.productionLot.dto.ProductionLotDefectRequest;
import htmp.codien.quanlycodien.modules.newmodel.productionLot.dto.ProductionLotDefectResponse;
import htmp.codien.quanlycodien.modules.newmodel.productionLot.dto.ProductionLotRequest;
import htmp.codien.quanlycodien.modules.newmodel.productionLot.dto.ProductionLotResponse;
import htmp.codien.quanlycodien.modules.newmodel.productionLot.entity.ProductionLot;
import htmp.codien.quanlycodien.modules.newmodel.productionLot.entity.ProductionLotDefectCode;
import htmp.codien.quanlycodien.modules.newmodel.productionLot.repository.ProductionLotDefectCodeRepository;
import htmp.codien.quanlycodien.modules.newmodel.productionLot.repository.ProductionLotRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductionLotServiceImpl implements ProductionLotService {

    private final ProductionLotRepository productionLotRepository;
    private final ProductDefectCodeRepository defectCodeRepository;
    private final ProductionLotDefectCodeRepository productionLotDefectCodeRepository;
    private final EmployeeRepository employeeRepository;
    private final ProductPlanRepository productPlanRepository;
    private final ModelMapper modelMapper;

    @Override
    public void createProductionLot(ProductionLotRequest request) {
        ProductionLot productionLot = ProductionLot.builder()
                .quantity(request.getQuantity())
                .productionDate(request.getProductionDate())
                .qcCheckResult(request.getQcCheckResult())
                .build();

        if (request.getCheckedById() != null) {
            Employee checkedBy = employeeRepository.findById(request.getCheckedById())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Nhân viên không tồn tại với id: " + request.getCheckedById()));
            productionLot.setCheckedBy(checkedBy);
        }

        if (request.getProductPlanId() != null) {
            ProductPlan productPlan = productPlanRepository.findById(request.getProductPlanId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Kế hoạch sản phẩm không tồn tại với id: " + request.getProductPlanId()));
            productionLot.setPlan(productPlan);
        }

        ProductionLot savedProductionLot = productionLotRepository.save(productionLot);

        if (request.getDefectDetails() != null && !request.getDefectDetails().isEmpty()) {
            createDefectDetails(savedProductionLot, request.getDefectDetails());

            Integer totalNgQuantity = request.getDefectDetails().stream()
                    .mapToInt(ProductionLotDefectRequest::getQuantity)
                    .sum();
            savedProductionLot.setNgQuantity(totalNgQuantity);
            productionLotRepository.save(savedProductionLot);
        }
    }

    @Override
    public void updateProductionLot(Long id, ProductionLotRequest request) {
        ProductionLot existingLot = productionLotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductionLot not found with id: " + id));

        existingLot.setQuantity(request.getQuantity());
        existingLot.setProductionDate(request.getProductionDate());
        existingLot.setQcCheckResult(request.getQcCheckResult());

        if (request.getCheckedById() != null) {
            Employee checkedBy = employeeRepository.findById(request.getCheckedById())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Employee not found with id: " + request.getCheckedById()));
            existingLot.setCheckedBy(checkedBy);
        }

        productionLotRepository.save(existingLot);

        if (request.getDefectDetails() != null) {

            productionLotDefectCodeRepository.deleteByProductionLotId(id);

            if (!request.getDefectDetails().isEmpty()) {
                createDefectDetails(existingLot, request.getDefectDetails());

                Integer totalNgQuantity = request.getDefectDetails().stream()
                        .mapToInt(ProductionLotDefectRequest::getQuantity)
                        .sum();
                existingLot.setNgQuantity(totalNgQuantity);
                productionLotRepository.save(existingLot);
            } else {

                existingLot.setNgQuantity(0);
                productionLotRepository.save(existingLot);
            }
        }
    }

    @Override
    public void deleteProductionLot(Long id) {
        if (!productionLotRepository.existsById(id)) {
            throw new ResourceNotFoundException("ProductionLot not found with id: " + id);
        }
        productionLotRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductionLotResponse getProductionLotById(Long id) {
        ProductionLot productionLot = productionLotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductionLot not found with id: " + id));
        return mapToResponse(productionLot);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductionLotResponse> getAllProductionLots() {
        return productionLotRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductionLotResponse> getProductionLotsByProductPlan(Long productPlanId) {
        try {
            List<ProductionLot> lots = productionLotRepository.findByPlan_Id(productPlanId);

            List<ProductionLotResponse> responses = new ArrayList<>();

            for (ProductionLot lot : lots) {
                ProductionLotResponse response = mapToResponse(lot);
                responses.add(response);
            }

            return responses;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy danh sách vấn đề phát sinh khi thử khuôn: " + e.getMessage(), e);
        }
    }
















































    private ProductionLotResponse mapToResponse(ProductionLot productionLot) {
        ProductionLotResponse response = modelMapper.map(productionLot,
                ProductionLotResponse.class);

        List<ProductionLotDefectResponse> defectDetails = productionLot.getDefectDetails().stream()
                .map(detail -> ProductionLotDefectResponse.builder()
                        .id(detail.getId())
                        .defectCodeId(detail.getDefectCode().getId())
                        .defectCode(detail.getDefectCode().getCode())
                        .defectDescription(detail.getDefectCode().getDescription())
                        .quantity(detail.getQuantity())
                        .build())
                .collect(Collectors.toList());
        response.setDefectDetails(defectDetails);

        if (productionLot.getCheckedBy() != null) {
            response.setCheckedBy(ProductionLotResponse.EmployeeInfo.builder()
                    .id(productionLot.getCheckedBy().getId())
                    .name(productionLot.getCheckedBy().getName())
                    .code(productionLot.getCheckedBy().getCode())
                    .build());
        }

        if (productionLot.getPlan() != null) {
            ProductPlan plan = productionLot.getPlan();
            ProductionLotResponse.ProductPlanInfo planInfo = ProductionLotResponse.ProductPlanInfo.builder()
                    .id(plan.getId())
                    .planName(plan.getName())
                    .build();

            if (plan.getProduct() != null) {
                planInfo.setProductCode(plan.getProduct().getCode());
                planInfo.setProductName(plan.getProduct().getName());
            }

            response.setProductPlan(planInfo);
        }

        return response;
    }

    private void createDefectDetails(ProductionLot productionLot, List<ProductionLotDefectRequest> defectRequests) {
        List<ProductionLotDefectCode> defectDetails = new ArrayList<>();

        for (ProductionLotDefectRequest defectRequest : defectRequests) {

            ProductDefectCode defectCode = defectCodeRepository.findById(defectRequest.getDefectCodeId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "DefectCode not found with id: " + defectRequest.getDefectCodeId()));

            ProductionLotDefectCode defectDetail = ProductionLotDefectCode.builder()
                    .productionLot(productionLot)
                    .defectCode(defectCode)
                    .quantity(defectRequest.getQuantity())
                    .build();

            defectDetails.add(defectDetail);
        }

        productionLotDefectCodeRepository.saveAll(defectDetails);
    }
}