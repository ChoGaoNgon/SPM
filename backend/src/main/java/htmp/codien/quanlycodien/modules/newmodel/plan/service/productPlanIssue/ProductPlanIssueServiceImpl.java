package htmp.codien.quanlycodien.modules.newmodel.plan.service.productPlanIssue;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.infrastructure.storage.FileStorageService;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productMoldTrialPlanIssue.ProductPlanIssueCreationRequest;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productMoldTrialPlanIssue.ProductPlanIssueDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productMoldTrialPlanIssue.ProductPlanIssueDefectCodeDTO;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productMoldTrialPlanIssue.ProductPlanIssueFileResponse;
import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productMoldTrialPlanIssue.ProductPlanIssueResponse;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanIssue;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanIssueDefectCode;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlanIssueFile;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductDefectCode;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductDefectCodeRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanIssueRepository;
import htmp.codien.quanlycodien.modules.newmodel.plan.repository.ProductPlanRepository;
import htmp.codien.quanlycodien.modules.newmodel.product.enums.FileUploadProductType;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.IssueStatus;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductPlanIssueServiceImpl implements ProductPlanIssueService {

    private final ProductPlanRepository productPlanRepository;
    private final ProductPlanIssueRepository ProductPlanIssueRepository;
    private final ProductDefectCodeRepository productDefectCodeRepository;
    private final ModelMapper modelMapper;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public void createPlanIssue(Long planId, ProductPlanIssueCreationRequest req,
            List<MultipartFile> beforeFiles, List<MultipartFile> afterFiles,
            String keptOldFilesJson, String deletedOldFilesJson) {
        try {

            ProductPlan plan = productPlanRepository.findById(planId)
                    .orElseThrow(() -> new ResourceNotFoundException("Kế hoạch thử khuôn không tồn tại."));

            ProductPlanIssue issue = modelMapper.map(req, ProductPlanIssue.class);
            issue.setId(null);
            issue.setPlan(plan);
            issue.setImplemented(Boolean.TRUE.equals(req.getImplemented()));
            issue.setIssueType(req.getIssueType());
            issue.setRepairDeadline(req.getRepairDeadline());

            if (issue.getDefectCodes() != null) {
                issue.getDefectCodes().clear();
            } else {
                issue.setDefectCodes(new ArrayList<>());
            }
            if (issue.getFiles() != null) {
                issue.getFiles().clear();
            } else {
                issue.setFiles(new ArrayList<>());
            }

            issue = ProductPlanIssueRepository.save(issue);
            ProductPlanIssueRepository.flush();

            if (req.getDefectCodes() != null && !req.getDefectCodes().isEmpty()) {
                for (ProductPlanIssueDefectCodeDTO dcDto : req.getDefectCodes()) {
                    ProductDefectCode defectCode = productDefectCodeRepository.findById(dcDto.getDefectCodeId())
                            .orElseThrow(() -> new ResourceNotFoundException("Mã lỗi không tồn tại."));

                    ProductPlanIssueDefectCode issueDefectCode = ProductPlanIssueDefectCode.builder()
                            .issue(issue)
                            .defectCode(defectCode)
                            .quantity(dcDto.getQuantity())
                            .note(dcDto.getNote())
                            .build();

                    issue.getDefectCodes().add(issueDefectCode);
                }
            }

            if (beforeFiles != null && !beforeFiles.isEmpty()) {
                for (MultipartFile file : beforeFiles) {
                    if (file == null || file.isEmpty())
                        continue;

                    String fileUrl = fileStorageService.saveProductAttachment(
                            plan.getProduct().getModel().getCode(),
                            plan.getProduct().getCode(),
                            plan.getName(),
                            FileUploadProductType.ISSUE,
                            file);

                    ProductPlanIssueFile issueFile = ProductPlanIssueFile.builder()
                            .filePath(fileUrl)
                            .remark(file.getOriginalFilename())
                            .status(IssueStatus.BEFORE)
                            .issue(issue)
                            .build();

                    issue.getFiles().add(issueFile);
                }
            }

            if (afterFiles != null && !afterFiles.isEmpty()) {
                for (MultipartFile file : afterFiles) {
                    if (file == null || file.isEmpty())
                        continue;

                    String fileUrl = fileStorageService.saveProductAttachment(
                            plan.getProduct().getModel().getCode(),
                            plan.getProduct().getCode(),
                            plan.getName(),
                            FileUploadProductType.ISSUE,
                            file);

                    ProductPlanIssueFile issueFile = ProductPlanIssueFile.builder()
                            .filePath(fileUrl)
                            .remark(file.getOriginalFilename())
                            .status(IssueStatus.AFTER)
                            .issue(issue)
                            .build();

                    issue.getFiles().add(issueFile);
                }
            }

            ProductPlanIssueRepository.save(issue);

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi thêm vấn đề phát sinh khi thử khuôn: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void updatePlanIssue(Long id, ProductPlanIssueCreationRequest req,
            List<MultipartFile> beforeFiles, List<MultipartFile> afterFiles,
            String keptOldFilesJson, String deletedOldFilesJson) {
        try {

            ProductPlanIssue existingIssue = ProductPlanIssueRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Vấn đề thử khuôn không tồn tại."));

            existingIssue.setIssueType(req.getIssueType());
            existingIssue.setIssueDescription(req.getIssueDescription());
            existingIssue.setCause(req.getCause());
            existingIssue.setImprovePlan(req.getImprovePlan());
            existingIssue.setRepairDeadline(req.getRepairDeadline());
            existingIssue.setImplemented(Boolean.TRUE.equals(req.getImplemented()));

            existingIssue.getDefectCodes().clear();
            if (req.getDefectCodes() != null && !req.getDefectCodes().isEmpty()) {
                for (ProductPlanIssueDefectCodeDTO dcDto : req.getDefectCodes()) {
                    ProductDefectCode defectCode = productDefectCodeRepository.findById(dcDto.getDefectCodeId())
                            .orElseThrow(() -> new ResourceNotFoundException("Mã lỗi không tồn tại."));

                    ProductPlanIssueDefectCode issueDefectCode = ProductPlanIssueDefectCode.builder()
                            .issue(existingIssue)
                            .defectCode(defectCode)
                            .quantity(dcDto.getQuantity())
                            .note(dcDto.getNote())
                            .build();

                    existingIssue.getDefectCodes().add(issueDefectCode);
                }
            }

            ObjectMapper mapper = new ObjectMapper();
            List<String> keptOldFiles = keptOldFilesJson != null
                    ? mapper.readValue(keptOldFilesJson, new TypeReference<List<String>>() {
                    })
                    : Collections.emptyList();
            List<String> deletedOldFiles = deletedOldFilesJson != null
                    ? mapper.readValue(deletedOldFilesJson, new TypeReference<List<String>>() {
                    })
                    : Collections.emptyList();

            Iterator<ProductPlanIssueFile> fileIterator = existingIssue.getFiles().iterator();
            while (fileIterator.hasNext()) {
                ProductPlanIssueFile file = fileIterator.next();
                if (deletedOldFiles.contains(file.getRemark())) {
                    fileStorageService.deleteFile(file.getFilePath());
                    fileIterator.remove();
                }
            }

            if (beforeFiles != null) {
                for (MultipartFile newFile : beforeFiles) {
                    if (newFile == null || newFile.isEmpty())
                        continue;

                    String fileUrl = fileStorageService.saveProductAttachment(
                            existingIssue.getPlan().getProduct().getModel().getCode(),
                            existingIssue.getPlan().getProduct().getCode(),
                            existingIssue.getPlan().getName(),
                            FileUploadProductType.ISSUE,
                            newFile);

                    ProductPlanIssueFile issueFile = ProductPlanIssueFile.builder()
                            .filePath(fileUrl)
                            .remark(newFile.getOriginalFilename())
                            .status(IssueStatus.BEFORE)
                            .issue(existingIssue)
                            .build();

                    existingIssue.getFiles().add(issueFile);
                }
            }

            if (afterFiles != null) {
                for (MultipartFile newFile : afterFiles) {
                    if (newFile == null || newFile.isEmpty())
                        continue;

                    String fileUrl = fileStorageService.saveProductAttachment(
                            existingIssue.getPlan().getProduct().getModel().getCode(),
                            existingIssue.getPlan().getProduct().getCode(),
                            existingIssue.getPlan().getName(),
                            FileUploadProductType.ISSUE,
                            newFile);

                    ProductPlanIssueFile issueFile = ProductPlanIssueFile.builder()
                            .filePath(fileUrl)
                            .remark(newFile.getOriginalFilename())
                            .status(IssueStatus.AFTER)
                            .issue(existingIssue)
                            .build();

                    existingIssue.getFiles().add(issueFile);
                }
            }

            ProductPlanIssueRepository.save(existingIssue);

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi cập nhật vấn đề thử khuôn: " + e.getMessage(), e);
        }
    }

    @Override
    public List<ProductPlanIssueResponse> getAllIssuesByPlanId(Long planId) {
        try {
            productPlanRepository.findById(planId)
                    .orElseThrow(() -> new RuntimeException("Mã kế hoạch thử khuôn không tồn tại"));
            List<ProductPlanIssue> issues = ProductPlanIssueRepository.findByPlan_Id(planId);

            List<ProductPlanIssueResponse> responses = new ArrayList<>();
            for (ProductPlanIssue issue : issues) {
                ProductPlanIssueResponse res = modelMapper.map(issue, ProductPlanIssueResponse.class);

                res.setFiles(issue.getFiles().stream()
                        .map(file -> ProductPlanIssueFileResponse.builder()
                                .id(file.getId())
                                .filePath(file.getFilePath())
                                .status(file.getStatus())
                                .remark(file.getRemark())
                                .build())
                        .collect(java.util.stream.Collectors.toSet()));

                res.setDefectCodes(issue.getDefectCodes().stream()
                        .map(dc -> ProductPlanIssueDefectCodeDTO.builder()
                                .id(dc.getId())
                                .defectCodeId(dc.getDefectCode().getId())
                                .defectCode(dc.getDefectCode().getCode())
                                .defectCodeDescription(dc.getDefectCode().getDescription())
                                .quantity(dc.getQuantity())
                                .note(dc.getNote())
                                .build())
                        .collect(java.util.stream.Collectors.toSet()));

                responses.add(res);
            }

            return responses;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy danh sách vấn đề phát sinh khi thử khuôn: " + e.getMessage(), e);
        }
    }

    @Override
    public List<ProductPlanIssueDTO> getAllIssues() {
        List<Object[]> issues = ProductPlanIssueRepository.findAllIssues();

        List<ProductPlanIssueDTO> responses = new ArrayList<>();
        for (Object[] row : issues) {
            ProductPlanIssueDTO dto = new ProductPlanIssueDTO();
            dto.setId(((Number) row[0]).longValue());
            dto.setProductCode(row[1] != null ? (String) row[1] : null);
            dto.setPlanName(row[2] != null ? (String) row[2] : null);
            dto.setIssueDescription(row[3] != null ? (String) row[3] : null);
            dto.setCause(row[4] != null ? (String) row[4] : null);
            dto.setImprovePlan(row[5] != null ? (String) row[5] : null);
            dto.setImplemented(row[6] != null && ((Number) row[6]).intValue() == 1);
            dto.setCreatedAt(
                    row[7] != null ? ((Timestamp) row[7]).toLocalDateTime() : null);
            String filesJson = row[8] != null ? row[8].toString() : "[]";

            ObjectMapper mapper = new ObjectMapper();

            Set<ProductPlanIssueFileResponse> files;
            try {
                files = mapper.readValue(filesJson,
                        new TypeReference<Set<ProductPlanIssueFileResponse>>() {
                        });
            } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
                throw new RuntimeException("Lỗi khi phân tích JSON cho files: " + e.getMessage(), e);
            }

            dto.setFiles(files);
            responses.add(dto);
        }

        return responses;
    }

    @Override
    @Transactional
    public void deletePlanIssue(Long id) {
        try {
            ProductPlanIssue issue = ProductPlanIssueRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Vấn đề thử khuôn không tồn tại."));

            for (ProductPlanIssueFile file : issue.getFiles()) {
                fileStorageService.deleteFile(file.getFilePath());
            }

            ProductPlanIssueRepository.delete(issue);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xóa vấn đề phát sinh khi thử khuôn: " + e.getMessage(), e);
        }
    }

}
