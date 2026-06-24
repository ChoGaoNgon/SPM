package htmp.codien.quanlycodien.modules.asset.service;

import htmp.codien.quanlycodien.modules.asset.dto.assignment.AssetAssignmentCreationRequest;
import htmp.codien.quanlycodien.modules.asset.dto.assignment.AssetAssignmentResponse;
import htmp.codien.quanlycodien.modules.asset.dto.assignment.AssetAssignmentUpdationRequest;
import htmp.codien.quanlycodien.modules.asset.entity.Asset;
import htmp.codien.quanlycodien.modules.asset.entity.AssetAssignment;
import htmp.codien.quanlycodien.modules.asset.enums.AssetAssignmentStatus;
import htmp.codien.quanlycodien.modules.asset.repository.AssetAssignmentRepository;
import htmp.codien.quanlycodien.modules.asset.repository.AssetRepository;
import htmp.codien.quanlycodien.modules.department.entity.Department;
import htmp.codien.quanlycodien.modules.department.repository.DepartmentRepository;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AssetAssignmentServiceImpl implements AssetAssignmentService {

        private final AssetAssignmentRepository assetAssignmentRepository;
        private final AssetRepository assetRepository;
        private final EmployeeRepository employeeRepository;
        private final DepartmentRepository departmentRepository;

        @Override
        @Transactional(readOnly = true)
        public AssetAssignmentResponse getAssetAssignmentById(Long id) {
                AssetAssignment assignment = assetAssignmentRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Không tìm thấy phân công tài sản với id: " + id));
                return toResponse(assignment);
        }

        @Override
        @Transactional
        public void createAssetAssignment(AssetAssignmentCreationRequest request) {

                Asset asset = assetRepository.findById(request.getAssetId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Không tìm thấy tài sản với id: " + request.getAssetId()));

                Employee employee = null;
                if (request.getEmployeeUseId() != null) {
                        employee = employeeRepository.findById(request.getEmployeeUseId())
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Không tìm thấy nhân viên với id: "
                                                                        + request.getEmployeeUseId()));
                }

                Department department = null;
                if (request.getDepartmentUseId() != null) {
                        department = departmentRepository.findById(request.getDepartmentUseId())
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Không tìm thấy phòng ban với id: "
                                                                        + request.getDepartmentUseId()));
                }

                if (assetAssignmentRepository.existsByAssetIdAndReturnAtIsNull(request.getAssetId())) {
                        throw new RuntimeException("Thiết bị đã được cấp phát, chưa trả");
                }

                AssetAssignment assignment = AssetAssignment.builder()
                                .asset(asset)
                                .employeeUse(employee)
                                .departmentUse(department)
                                .assignAt(request.getAssignAt())
                                .build();

                assetAssignmentRepository.save(assignment);

                asset.setStatus(AssetAssignmentStatus.IN_USE);

        }

        @Override
        public void updateAssetAssignment(Long id, AssetAssignmentUpdationRequest request) {

                AssetAssignment existingAssignment = assetAssignmentRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Không tìm thấy phân công tài sản với id: " + id));

                Employee employee = null;
                if (request.getEmployeeUseId() != null) {
                        employee = employeeRepository.findById(request.getEmployeeUseId())
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Không tìm thấy nhân viên với id: "
                                                                        + request.getEmployeeUseId()));
                }

                Department department = null;
                if (request.getDepartmentUseId() != null) {
                        department = departmentRepository.findById(request.getDepartmentUseId())
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Không tìm thấy phòng ban với id: "
                                                                        + request.getDepartmentUseId()));
                }

                existingAssignment.setEmployeeUse(employee);
                existingAssignment.setDepartmentUse(department);
                existingAssignment.setAssignAt(request.getAssignAt());
                existingAssignment.setReturnAt(request.getReturnAt());

                assetAssignmentRepository.save(existingAssignment);
        }

        @Override
        public void deleteAssetAssignment(Long id) {

                AssetAssignment assignment = assetAssignmentRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Không tìm thấy phân công tài sản với id: " + id));

                assetAssignmentRepository.delete(assignment);
        }

        @Override
        @Transactional(readOnly = true)
        public List<AssetAssignmentResponse> getAssetAssignmentsByAssetId(Long assetId) {
                List<AssetAssignment> assignments = assetAssignmentRepository.findByAssetId(assetId);
                return assignments.stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional(readOnly = true)
        public List<AssetAssignmentResponse> getAssetAssignmentsByEmployeeId(Long employeeId) {
                List<AssetAssignment> assignments = assetAssignmentRepository.findByEmployeeUseId(employeeId);
                return assignments.stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        private AssetAssignmentResponse toResponse(AssetAssignment assignment) {
                return AssetAssignmentResponse.builder()
                                .id(assignment.getId())
                                .employeeUseId(assignment.getEmployeeUse() != null ? assignment.getEmployeeUse().getId()
                                                : null)
                                .employeeUseName(assignment.getEmployeeUse() != null
                                                ? assignment.getEmployeeUse().getName()
                                                : null)
                                .employeeUseCode(assignment.getEmployeeUse() != null
                                                ? assignment.getEmployeeUse().getCode()
                                                : null)
                                .departmentUseId(assignment.getDepartmentUse() != null
                                                ? assignment.getDepartmentUse().getId()
                                                : null)
                                .departmentUseName(assignment.getDepartmentUse() != null
                                                ? assignment.getDepartmentUse().getName()
                                                : null)
                                .assetId(assignment.getAsset().getId())
                                .assignAt(assignment.getAssignAt())
                                .returnAt(assignment.getReturnAt())
                                .build();
        }
}