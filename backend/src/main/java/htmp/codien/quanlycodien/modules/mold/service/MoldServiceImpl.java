package htmp.codien.quanlycodien.modules.mold.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import htmp.codien.quanlycodien.common.exception.ConflictException;
import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.modules.mold.dto.MoldIssueResponse;
import htmp.codien.quanlycodien.modules.mold.dto.MoldRequest;
import htmp.codien.quanlycodien.modules.mold.dto.MoldResponse;
import htmp.codien.quanlycodien.modules.mold.entity.Mold;
import htmp.codien.quanlycodien.modules.mold.repository.MoldRepository;
import htmp.codien.quanlycodien.modules.mold.specification.MoldSpecification;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.Product;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productMoldTrialPlanIssue.ProductPlanIssueDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productMoldTrialPlanIssue.ProductPlanIssueDefectCodeDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productMoldTrialPlanIssue.ProductPlanIssueFileResponse;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanIssue;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanIssueRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.repository.ProductRepository;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.IssueType;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.MoldDevelopmentByCustomerProjection;
import htmp.codien.quanlycodien.modules.newmodel.statistic.projection.MoldIssueStatisticsProjection;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MoldServiceImpl implements MoldService {
    private final MoldRepository moldRepository;
    private final ProductRepository productRepository;
    private final ProductPlanIssueRepository productPlanIssueRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<MoldResponse> getAllMolds() {
        List<Mold> molds = moldRepository.findAll();
        return molds.stream()
                .map(mold -> modelMapper.map(mold, MoldResponse.class))
                .toList();

    }

    @Override
    public List<MoldIssueStatisticsProjection> getMoldIssueStatistics(Integer limit) {
        int normalizedLimit = (limit == null || limit <= 0) ? 5 : limit;
        return moldRepository.getMoldIssueStatistics(PageRequest.of(0, normalizedLimit));
    }

    @Override
    public List<MoldDevelopmentByCustomerProjection> getDevelopingMoldStatisticsByCustomer() {
        return moldRepository.getDevelopingMoldStatisticsByCustomer();
    }

    @Override
    @Transactional
    public List<MoldIssueResponse> getMoldIssues(Long moldId) {
        List<ProductPlanIssue> issues = productPlanIssueRepository
                .findByPlan_Product_Mold_IdAndIssueType(moldId, IssueType.MOLD_ERROR);

        Map<ProductPlan, List<ProductPlanIssue>> groupedByPlan = issues.stream()
                .collect(Collectors.groupingBy(ProductPlanIssue::getPlan));

        List<MoldIssueResponse> result = new ArrayList<>();
        for (Map.Entry<ProductPlan, List<ProductPlanIssue>> entry : groupedByPlan.entrySet()) {
            ProductPlan plan = entry.getKey();
            Product product = plan.getProduct();

            List<ProductPlanIssueDTO> issueDTOs = entry.getValue().stream()
                    .map(issue -> ProductPlanIssueDTO.builder()
                            .id(issue.getId())
                            .issueType(issue.getIssueType())
                            .issueDescription(issue.getIssueDescription())
                            .cause(issue.getCause())
                            .improvePlan(issue.getImprovePlan())
                            .repairDeadline(issue.getRepairDeadline())
                            .implemented(issue.getImplemented())
                            .createdAt(issue.getCreatedAt())
                            .files(issue.getFiles().stream()
                                    .map(f -> ProductPlanIssueFileResponse.builder()
                                            .id(f.getId())
                                            .filePath(f.getFilePath())
                                            .status(f.getStatus())
                                            .remark(f.getRemark())
                                            .build())
                                    .collect(Collectors.toSet()))
                            .defectCodes(issue.getDefectCodes().stream()
                                    .map(dc -> ProductPlanIssueDefectCodeDTO.builder()
                                            .id(dc.getId())
                                            .defectCodeId(dc.getDefectCode().getId())
                                            .defectCode(dc.getDefectCode().getCode())
                                            .defectCodeDescription(dc.getDefectCode().getDescription())
                                            .quantity(dc.getQuantity())
                                            .note(dc.getNote())
                                            .build())
                                    .collect(Collectors.toSet()))
                            .build())
                    .collect(Collectors.toList());

            result.add(MoldIssueResponse.builder()
                    .moldId(moldId)
                    .modelId(product.getModel().getId())
                    .modelCode(product.getModel().getCode())
                    .productId(product.getId())
                    .productCode(product.getCode())
                    .productPlanId(plan.getId())
                    .planName(plan.getName())
                    .productPlanIssues(issueDTOs)
                    .build());
        }

        return result;
    }

    @Override
    public void create(MoldRequest moldRequest) {
        try {

            boolean exists = moldRepository.existsByCode(moldRequest.getCode());
            if (exists) {
                throw new ConflictException("Khuôn với mã " + moldRequest.getCode() + " đã tồn tại.");
            }

            Mold mold = modelMapper.map(moldRequest, Mold.class);
            moldRepository.save(mold);
        } catch (ConflictException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {

            throw new RuntimeException("Lỗi khi tạo khuôn mới: " + e.getMessage(), e);
        }
    }

    @Override
    public void update(Long id, MoldRequest moldRequest) {
        try {
            Mold mold = moldRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Khuôn với id " + id + " không tồn tại."));

            boolean exists = moldRepository.existsByCodeAndIdNot(moldRequest.getCode(), id);
            if (exists) {
                throw new ConflictException("Khuôn đã " + moldRequest.getCode() + " tồn tại");
            }

            modelMapper.map(moldRequest, mold);
            mold.setId(id);
            moldRepository.save(mold);
        } catch (ConflictException | ResourceNotFoundException e) {

            throw e;
        } catch (Exception e) {

            throw new RuntimeException("Lỗi khi cập nhật khuôn : " + e.getMessage(), e);
        }
    }

    public MoldResponse getMoldByCode(String code) {
        Mold mold = moldRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Khuôn với mã " + code + " không tồn tại."));
        return modelMapper.map(mold, MoldResponse.class);
    }

    public MoldResponse getMoldByID(Long id) {
        Mold mold = moldRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khuôn với id " + id + " không tồn tại."));
        return modelMapper.map(mold, MoldResponse.class);
    }

    @Override
    public List<MoldResponse> searchMoldSpecification(String keyword) {
        List<Mold> molds = moldRepository.findAll(MoldSpecification.searchByKeyword(keyword));
        return molds.stream()
                .map(mold -> modelMapper.map(mold, MoldResponse.class))
                .toList();
    }

    @Override
    public void delete(Long id) {

        List<Product> productWithMold = productRepository.findByMoldId(id);
        if (!productWithMold.isEmpty()) {
            throw new ConflictException("Không thể xóa khuôn vì đã có sản phẩm liên kết với khuôn này.");
        }
        Mold mold = moldRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khuôn với id " + id + " không tồn tại."));
        moldRepository.delete(mold);
    }
}
