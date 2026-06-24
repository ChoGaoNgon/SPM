package htmp.codien.quanlycodien.modules.newmodel.bomlist.service;

import java.time.LocalDateTime;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.infrastructure.storage.FileStorageService;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.newmodel.bomlist.dto.BomListApprovalRequest;
import htmp.codien.quanlycodien.modules.newmodel.bomlist.dto.BomListRequest;
import htmp.codien.quanlycodien.modules.newmodel.bomlist.dto.BomListResponse;
import htmp.codien.quanlycodien.modules.newmodel.bomlist.entity.BomList;
import htmp.codien.quanlycodien.modules.newmodel.bomlist.repository.BomListRepositoy;
import htmp.codien.quanlycodien.modules.newmodel.product.enums.FileUploadProductType;
import htmp.codien.quanlycodien.modules.newmodel.productModel.entity.Model;
import htmp.codien.quanlycodien.modules.newmodel.productModel.repository.ModelRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BomListServiceImpl implements BomListService {
    private final BomListRepositoy bomListRepositoy;
    private final ModelRepository modelRepository;
    private final ModelMapper modelMapper;
    private final EmployeeRepository employeeRepository;
    private final FileStorageService fileStorageService;

    @PostConstruct
    public void setupMapper() {
        modelMapper.createTypeMap(BomListRequest.class, BomList.class)
                .addMappings(mapper -> mapper.skip(BomList::setId));
    }

    @Override
    public void createBomlist(Long modelId, BomListRequest req, MultipartFile uploadFile) {
        try {
            Model model = modelRepository.findById(modelId)
                    .orElseThrow(() -> new RuntimeException("Model không tồn tại"));

            Employee checkedBy = null;
            if (req.getCheckedById() != null) {
                checkedBy = employeeRepository.findById(req.getCheckedById())
                        .orElseThrow(() -> new RuntimeException("Nhân viên kiểm tra không tồn tại"));
            }

            BomList bomList = modelMapper.map(req, BomList.class);

            bomList.setCheckedBy(checkedBy);
            bomList.setModel(model);

            if (uploadFile != null && !uploadFile.isEmpty()) {
                String fileUrl = fileStorageService.saveProductAttachment(
                        model.getCode(),
                        null,
                        null,
                        FileUploadProductType.BOMLIST, uploadFile);
                bomList.setFileUrl(fileUrl);
            }

            bomListRepositoy.save(bomList);

        } catch (Exception e) {

            throw new RuntimeException("Lỗi khi tạo bomlist: " + e.getMessage(), e);
        }
    }

    @Override
    public void updateBomlist(Long id, BomListRequest req, MultipartFile uploadFile) {
        try {
            BomList bomList = bomListRepositoy.findById(id)
                    .orElseThrow(() -> new RuntimeException("Bomlist không tồn tại"));

            Employee checkedBy = null;
            if (req.getCheckedById() != null) {
                checkedBy = employeeRepository.findById(req.getCheckedById())
                        .orElseThrow(() -> new RuntimeException("Nhân viên kiểm tra không tồn tại"));
            }

            bomList.setPhase(req.getPhase());
            bomList.setVersion(req.getVersion());
            bomList.setCheckResult(req.getCheckResult());
            bomList.setCheckAt(req.getCheckAt());

            bomList.setCheckedBy(checkedBy);

            if (uploadFile != null && !uploadFile.isEmpty()) {
                String fileUrl = fileStorageService.saveProductAttachment(
                        bomList.getModel().getCode(),
                        null,
                        null,
                        FileUploadProductType.BOMLIST, uploadFile);
                bomList.setFileUrl(fileUrl);
            }

            bomListRepositoy.save(bomList);

        } catch (Exception e) {

            throw new RuntimeException("Lỗi khi tạo bomlist: " + e.getMessage(), e);
        }
    }

    @Override
    public BomListResponse getBomListById(Long id) {
        try {
            BomList bomlist = bomListRepositoy.findById(id)
                    .orElseThrow(() -> new RuntimeException("Bomlist không tồn tại"));

            Employee checkedBy = employeeRepository.findById(bomlist.getCheckedBy().getId())
                    .orElseThrow(() -> new RuntimeException("Nhân viên kiểm tra không tồn tại"));

            Employee approvedBy = employeeRepository.findById(bomlist.getApprovedBy().getId())
                    .orElseThrow(() -> new RuntimeException("Nhân viên kiểm tra không tồn tại"));

            BomListResponse res = modelMapper.map(bomlist, BomListResponse.class);

            res.setApprovedById(approvedBy.getId());
            res.setApprovedByName(approvedBy.getName());
            res.setApprovedByCode(approvedBy.getCode());

            res.setCheckedById(checkedBy.getId());
            res.setCheckedByCode(checkedBy.getCode());
            res.setCheckedByName(checkedBy.getName());

            return res;
        } catch (Exception e) {

            throw new RuntimeException("Lỗi khi lấy bomlist: " + e.getMessage(), e);
        }
    }

    @Override
    public List<BomListResponse> getBomListByModelId(Long modelId) {
        try {
            List<BomList> bomLists = bomListRepositoy.findAllByModel_Id(modelId);

            if (bomLists.isEmpty()) {
                throw new RuntimeException("Không có BOM list nào cho model này");
            }

            return bomLists.stream().map(bomlist -> {
                BomListResponse res = modelMapper.map(bomlist, BomListResponse.class);

                if (bomlist.getCheckedBy() != null) {
                    res.setCheckedById(bomlist.getCheckedBy().getId());
                    res.setCheckedByCode(bomlist.getCheckedBy().getCode());
                    res.setCheckedByName(bomlist.getCheckedBy().getName());
                }

                if (bomlist.getApprovedBy() != null) {
                    res.setApprovedById(bomlist.getApprovedBy().getId());
                    res.setApprovedByCode(bomlist.getApprovedBy().getCode());
                    res.setApprovedByName(bomlist.getApprovedBy().getName());
                }

                return res;
            }).toList();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy danh sách BOM list: " + e.getMessage(), e);
        }
    }

    @Override
    public void approvalBomlist(Long id, BomListApprovalRequest req) {
        try {
            BomList bomList = bomListRepositoy.findById(id)
                    .orElseThrow(() -> new RuntimeException("Bomlist không tồn tại"));
            Employee approvedBy = SecurityUtils.getCurrentEmployee();
            bomList.setApprovedBy(approvedBy);
            bomList.setApprovalAt(LocalDateTime.now());
            bomList.setIsApprove(req.getIsApprove());
            bomList.setContent(req.getContent());

            bomListRepositoy.save(bomList);

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi phê duyệt bomlist: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteBomlist(Long id) {
        try {
            BomList bomList = bomListRepositoy.findById(id)
                    .orElseThrow(() -> new RuntimeException("Bomlist không tồn tại"));
            bomListRepositoy.delete(bomList);
            fileStorageService.deleteFile(bomList.getFileUrl());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xóa bomlist: " + e.getMessage(), e);
        }
    }
}
