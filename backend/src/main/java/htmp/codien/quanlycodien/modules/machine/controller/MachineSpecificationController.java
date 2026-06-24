package htmp.codien.quanlycodien.modules.machine.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.machine.dto.MachineSpecificationRequest;
import htmp.codien.quanlycodien.modules.machine.dto.MachineSpecificationResponse;
import htmp.codien.quanlycodien.modules.machine.service.MachineSpecificationService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/machine-specifications")
@RequiredArgsConstructor
public class MachineSpecificationController {

    private final MachineSpecificationService machineSpecificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MachineSpecificationResponse>>> getAllMachineSpecifications(
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) String keyword) {
        Page<MachineSpecificationResponse> machineSpecifications = machineSpecificationService
                .getAllMachineSpecifications(pageable, keyword);
        return ResponseUtil.success(machineSpecifications, "Lấy danh sách thông số kỹ thuật máy thành công");
    }

    @GetMapping("/machine/{machineId}")
    public ResponseEntity<ApiResponse<MachineSpecificationResponse>> getMachineSpecificationByMachineId(
            @PathVariable Long machineId) {
        MachineSpecificationResponse machineSpecification = machineSpecificationService
                .getMachineSpecificationByMachineId(machineId);
        return ResponseUtil.success(machineSpecification, "Lấy thông số kỹ thuật máy thành công");
    }

    @PostMapping("/machine/{machineId}")
    public ResponseEntity<ApiResponse<Void>> createMachineSpecification(@PathVariable Long machineId,
            @RequestBody MachineSpecificationRequest request) {
        machineSpecificationService.createMachineSpecification(machineId, request);
        return ResponseUtil.success(null, "Tạo thông số kỹ thuật máy thành công");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createMachineSpecification(
            @RequestBody MachineSpecificationRequest request) {
        machineSpecificationService.createMachineSpecification(request);
        return ResponseUtil.success(null, "Tạo thông số kỹ thuật máy thành công");
    }

    @PutMapping("/{specificationId}")
    public ResponseEntity<ApiResponse<Void>> updateMachineSpecification(@PathVariable Long specificationId,
            @RequestBody MachineSpecificationRequest request) {
        machineSpecificationService.updateMachineSpecification(specificationId, request);
        return ResponseUtil.success(null, "Cập nhật thông số kỹ thuật máy thành công");
    }

    @PutMapping("/machine/{machineId}")
    public ResponseEntity<ApiResponse<Void>> updateMachineSpecificationByMachineId(@PathVariable Long machineId,
            @RequestBody MachineSpecificationRequest request) {
        machineSpecificationService.updateMachineSpecificationByMachineId(machineId, request);
        return ResponseUtil.success(null, "Cập nhật thông số kỹ thuật máy thành công");
    }

    @DeleteMapping("/{specificationId}")
    public ResponseEntity<ApiResponse<Void>> deleteMachineSpecification(@PathVariable Long specificationId) {
        machineSpecificationService.deleteMachineSpecification(specificationId);
        return ResponseUtil.success(null, "Xóa thông số kỹ thuật máy thành công");
    }

    @DeleteMapping("/machine/{machineId}")
    public ResponseEntity<ApiResponse<Void>> deleteMachineSpecificationByMachineId(@PathVariable Long machineId) {
        machineSpecificationService.deleteMachineSpecificationByMachineId(machineId);
        return ResponseUtil.success(null, "Xóa thông số kỹ thuật máy thành công");
    }
}
