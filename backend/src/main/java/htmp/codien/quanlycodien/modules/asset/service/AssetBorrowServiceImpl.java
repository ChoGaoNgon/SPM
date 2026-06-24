package htmp.codien.quanlycodien.modules.asset.service;

import htmp.codien.quanlycodien.common.exception.ForbiddenException;
import htmp.codien.quanlycodien.common.util.SecurityUtils;
import htmp.codien.quanlycodien.modules.asset.dto.borrow.AssetBorrowCreationRequest;
import htmp.codien.quanlycodien.modules.asset.dto.borrow.AssetBorrowRejectRequest;
import htmp.codien.quanlycodien.modules.asset.dto.borrow.AssetBorrowResponse;
import htmp.codien.quanlycodien.modules.asset.dto.borrow.AssetBorrowUpdationRequest;
import htmp.codien.quanlycodien.modules.asset.entity.Asset;
import htmp.codien.quanlycodien.modules.asset.entity.AssetBorrow;
import htmp.codien.quanlycodien.modules.asset.enums.AssetAssignmentStatus;
import htmp.codien.quanlycodien.modules.asset.enums.AssetBorrowStatus;
import htmp.codien.quanlycodien.modules.asset.repository.AssetBorrowRepository;
import htmp.codien.quanlycodien.modules.asset.repository.AssetRepository;
import htmp.codien.quanlycodien.modules.asset.specification.AssetBorrowSpecification;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import htmp.codien.quanlycodien.modules.permission.service.PermissionService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssetBorrowServiceImpl implements AssetBorrowService {

    private static final String PERM_APPROVE = "ASSET_BORROW_APPROVE";
    private static final String PERM_RETURN = "ASSET_BORROW_RETURN";

    private final AssetBorrowRepository assetBorrowRepository;
    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;
    private final PermissionService permissionService;

    @Override
    @Transactional
    public void createAssetBorrow(Long assetId, AssetBorrowCreationRequest request) {
        Employee currentEmployee = requireCurrentEmployee();

        if (!canManageAllBorrows(currentEmployee)
                && !Objects.equals(request.getRequestedById(), currentEmployee.getId())) {
            throw new ForbiddenException("Bạn chỉ được phép tạo đơn mượn cho chính mình");
        }

        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy tài sản với id: "
                                + assetId));

        if (asset.getStatus() != null && asset.getStatus() != AssetAssignmentStatus.AVAILABLE) {
            throw new RuntimeException("Tài sản hiện không có sẵn để mượn");
        }

        if (request.getExpectedReturnAt().isBefore(request.getBorrowAt())) {
            throw new RuntimeException("Thời gian trả dự kiến phải sau thời gian mượn");
        }

        Employee requestedBy = employeeRepository.findById(request.getRequestedById())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy nhân viên với id: "
                                + request.getRequestedById()));

        AssetBorrow assetBorrow = AssetBorrow.builder()
                .asset(asset)
                .requestedBy(requestedBy)
                .status(AssetBorrowStatus.PENDING)
                .purpose(request.getPurpose())
                .borrowAt(request.getBorrowAt())
                .remark(request.getRemark())
                .expectedReturnAt(request.getExpectedReturnAt())
                .build();

        assetBorrowRepository.save(assetBorrow);
    }

    @Override
    @Transactional
    public void updateAssetBorrow(Long id, AssetBorrowUpdationRequest request) {
        AssetBorrow assetBorrow = findEntityById(id);
        Employee currentEmployee = requireCurrentEmployee();

        validatePendingStatus(assetBorrow);
        validateCanEditOrDelete(assetBorrow, currentEmployee);

        if (request.getRequestedById() != 0) {
            if (!canManageAllBorrows(currentEmployee)
                    && !Objects.equals(request.getRequestedById(), currentEmployee.getId())) {
                throw new ForbiddenException("Bạn không được thay đổi người mượn sang nhân viên khác");
            }

            Employee requestedBy = employeeRepository.findById(request.getRequestedById())
                    .orElseThrow(() -> new RuntimeException(
                            "Không tìm thấy nhân viên với id: "
                                    + request.getRequestedById()));
            assetBorrow.setRequestedBy(requestedBy);
        }

        if (request.getApprovedById() != 0) {
            Employee approvedBy = employeeRepository.findById(request.getApprovedById())
                    .orElseThrow(() -> new RuntimeException(
                            "Không tìm thấy nhân viên với id: "
                                    + request.getApprovedById()));
            assetBorrow.setApprovedBy(approvedBy);
        }

        if (request.getPurpose() != null) {
            assetBorrow.setPurpose(request.getPurpose());
        }
        if (request.getBorrowAt() != null) {
            assetBorrow.setBorrowAt(request.getBorrowAt());
        }
        if (request.getExpectedReturnAt() != null) {
            assetBorrow.setExpectedReturnAt(request.getExpectedReturnAt());
        }
        if (request.getActualReturnAt() != null) {
            assetBorrow.setActualReturnAt(request.getActualReturnAt());
        }
        if (request.getApprovedAt() != null) {
            assetBorrow.setApprovedAt(request.getApprovedAt());
        }
        if (request.getRemark() != null) {
            assetBorrow.setRemark(request.getRemark());
        }

        assetBorrowRepository.save(assetBorrow);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AssetBorrowResponse> getAllAssetBorrows(
            Pageable pageable,
            String keyword,
            Long requestedById,
            LocalDate date,
            LocalDate borrowDate,
            AssetBorrowStatus status) {

        Employee currentEmployee = requireCurrentEmployee();
        boolean canViewAll = canManageAllBorrows(currentEmployee);

        if (!canViewAll) {
            requestedById = currentEmployee.getId();
        }

        Specification<AssetBorrow> specification = null;

        if (keyword != null && !keyword.trim().isEmpty()) {
            Specification<AssetBorrow> keywordSpec = AssetBorrowSpecification.hasKeyword(keyword);

            specification = (specification == null)
                    ? keywordSpec
                    : specification.and(keywordSpec);
        }

        if (requestedById != null) {
            Specification<AssetBorrow> requestedBySpec = AssetBorrowSpecification.hasRequestedById(requestedById);

            specification = (specification == null)
                    ? requestedBySpec
                    : specification.and(requestedBySpec);
        }

        if (date != null) {
            Specification<AssetBorrow> dateSpec = AssetBorrowSpecification.hasAnyActionOnDate(date);

            specification = (specification == null)
                    ? dateSpec
                    : specification.and(dateSpec);
        }

        if (borrowDate != null) {
            Specification<AssetBorrow> borrowDateSpec = AssetBorrowSpecification.hasBorrowDate(borrowDate);

            specification = (specification == null)
                    ? borrowDateSpec
                    : specification.and(borrowDateSpec);
        }

        if (status != null) {
            Specification<AssetBorrow> statusSpec = AssetBorrowSpecification.hasStatus(status);

            specification = (specification == null)
                    ? statusSpec
                    : specification.and(statusSpec);
        }

        Page<AssetBorrow> assetBorrows = assetBorrowRepository.findAll(specification, pageable);

        return assetBorrows.map(this::convertToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AssetBorrowResponse getAssetBorrowById(Long id) {
        AssetBorrow assetBorrow = findEntityById(id);
        return convertToResponse(assetBorrow);
    }

    @Override
    @Transactional
    public void deleteAssetBorrow(Long id) {
        AssetBorrow assetBorrow = findEntityById(id);
        Employee currentEmployee = requireCurrentEmployee();

        validatePendingStatus(assetBorrow);
        validateCanEditOrDelete(assetBorrow, currentEmployee);

        assetBorrowRepository.delete(assetBorrow);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetBorrowResponse> getAssetBorrowsByRequestedById(Long requestedById) {
        List<AssetBorrow> assetBorrows = assetBorrowRepository.findByRequestedById(requestedById);
        return assetBorrows.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetBorrowResponse> getAssetBorrowsByAssetId(Long assetId) {
        List<AssetBorrow> assetBorrows = assetBorrowRepository.findByAssetId(assetId);
        return assetBorrows.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateStatusAssetBorrow(Long id, AssetBorrowStatus status) {

        Employee employeeCurrent = SecurityUtils.getCurrentEmployee();
        AssetBorrow assetBorrow = findEntityById(id);
        Employee approvedBy = employeeRepository.findById(employeeCurrent.getId())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy nhân viên với id: "
                                + employeeCurrent.getId()));

        assetBorrow.setStatus(status);

        if (status == AssetBorrowStatus.BORROWING) {
            Asset asset = assetBorrow.getAsset();
            asset.setStatus(AssetAssignmentStatus.IN_USE);

        }
        assetBorrow.setApprovedBy(approvedBy);
        assetBorrow.setApprovedAt(LocalDateTime.now());

        assetBorrowRepository.save(assetBorrow);
    }

    @Override
    @Transactional
    public void returnAsset(Long id) {
        Employee currentEmployee = requireCurrentEmployee();
        validateHasPermission(currentEmployee, PERM_RETURN, "Bạn không có quyền xác nhận trả tài sản");

        AssetBorrow assetBorrow = findEntityById(id);

        if (assetBorrow.getStatus() != AssetBorrowStatus.APPROVED) {
            throw new RuntimeException("Chỉ có thể trả tài sản đã được phê duyệt");
        }

        assetBorrow.setStatus(AssetBorrowStatus.RETURNED);
        assetBorrow.setActualReturnAt(LocalDateTime.now());

        assetBorrowRepository.save(assetBorrow);
    }

    @Override
    @Transactional(readOnly = true)
    public AssetBorrow findEntityById(Long id) {
        return assetBorrowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Đơn mượn tài sản không tồn tại với id: " + id));
    }

    private AssetBorrowResponse convertToResponse(AssetBorrow assetBorrow) {
        return AssetBorrowResponse.builder()
                .id(assetBorrow.getId())
                .assetId(assetBorrow.getAsset().getId())
                .assetCode(assetBorrow.getAsset().getCode())
                .requestedById(assetBorrow.getRequestedBy().getId())
                .requestedByCode(assetBorrow.getRequestedBy().getCode())
                .requestedByName(assetBorrow.getRequestedBy().getName())
                .approvedById(assetBorrow.getApprovedBy() != null ? assetBorrow.getApprovedBy().getId() : null)
                .approvedByCode(assetBorrow.getApprovedBy() != null ? assetBorrow.getApprovedBy().getCode() : null)
                .approvedByName(assetBorrow.getApprovedBy() != null ? assetBorrow.getApprovedBy().getName() : null)
                .status(assetBorrow.getStatus())
                .purpose(assetBorrow.getPurpose())
                .borrowAt(assetBorrow.getBorrowAt())
                .expectedReturnAt(assetBorrow.getExpectedReturnAt())
                .actualReturnAt(assetBorrow.getActualReturnAt())
                .approvedAt(assetBorrow.getApprovedAt())
                .remark(assetBorrow.getRemark())
                .build();
    }

    @Override
    public void approveAssetBorrow(Long id) {
        Employee employeeCurrent = requireCurrentEmployee();
        validateHasPermission(employeeCurrent, PERM_APPROVE, "Bạn không có quyền duyệt đơn mượn tài sản");

        AssetBorrow assetBorrow = findEntityById(id);
        validatePendingStatus(assetBorrow);

        Employee approvedBy = employeeRepository.findById(employeeCurrent.getId())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy nhân viên với id: "
                                + employeeCurrent.getId()));

        assetBorrow.setStatus(AssetBorrowStatus.APPROVED);
        assetBorrow.setApprovedBy(approvedBy);
        assetBorrow.setApprovedAt(LocalDateTime.now());

        assetBorrowRepository.save(assetBorrow);
    }

    @Override
    public void rejectAssetBorrow(Long id, AssetBorrowRejectRequest req) {
        Employee employeeCurrent = requireCurrentEmployee();
        validateHasPermission(employeeCurrent, PERM_APPROVE, "Bạn không có quyền từ chối đơn mượn tài sản");

        AssetBorrow assetBorrow = findEntityById(id);
        validatePendingStatus(assetBorrow);

        Employee approvedBy = employeeRepository.findById(employeeCurrent.getId())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy nhân viên với id: "
                                + employeeCurrent.getId()));
        String remark = assetBorrow.getRemark() != null ? assetBorrow.getRemark() + "\n" : "";
        assetBorrow.setStatus(AssetBorrowStatus.REJECTED);
        assetBorrow.setApprovedBy(approvedBy);
        assetBorrow.setApprovedAt(LocalDateTime.now());
        assetBorrow.setRemark(remark + req.getRemark());
        assetBorrowRepository.save(assetBorrow);
    }

    private Employee requireCurrentEmployee() {
        Employee currentEmployee = SecurityUtils.getCurrentEmployee();
        if (currentEmployee == null || currentEmployee.getId() == null) {
            throw new ForbiddenException("Không xác định được người dùng hiện tại");
        }
        return employeeRepository.findById(currentEmployee.getId())
                .orElseThrow(() -> new ForbiddenException("Không xác định được người dùng hiện tại"));
    }

    private boolean hasPermission(Employee employee, String permissionCode) {
        return permissionService.hasPermission(employee, permissionCode);
    }

    private boolean hasAnyPermission(Employee employee, String... permissionCodes) {
        for (String permissionCode : permissionCodes) {
            if (hasPermission(employee, permissionCode)) {
                return true;
            }
        }
        return false;
    }

    private boolean canManageAllBorrows(Employee employee) {
        return hasAnyPermission(employee, PERM_APPROVE, PERM_RETURN);
    }

    private void validateHasPermission(Employee employee, String permissionCode, String message) {
        if (!hasPermission(employee, permissionCode)) {
            throw new ForbiddenException(message);
        }
    }

    private void validatePendingStatus(AssetBorrow assetBorrow) {
        if (assetBorrow.getStatus() != AssetBorrowStatus.PENDING) {
            throw new ForbiddenException("Chỉ có thể thao tác khi đơn đang ở trạng thái chờ duyệt");
        }
    }

    private void validateCanEditOrDelete(AssetBorrow assetBorrow, Employee currentEmployee) {
        if (canManageAllBorrows(currentEmployee)) {
            return;
        }

        Long ownerId = assetBorrow.getRequestedBy() != null ? assetBorrow.getRequestedBy().getId() : null;
        if (!Objects.equals(ownerId, currentEmployee.getId())) {
            throw new ForbiddenException("Bạn chỉ được phép sửa hoặc xóa đơn do chính mình tạo");
        }
    }

}