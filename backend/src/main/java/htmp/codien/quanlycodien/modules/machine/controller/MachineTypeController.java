package htmp.codien.quanlycodien.modules.machine.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.machine.dto.MachineTypeRequest;
import htmp.codien.quanlycodien.modules.machine.dto.MachineTypeResponse;
import htmp.codien.quanlycodien.modules.machine.service.MachineTypeService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/machine-types")
@RequiredArgsConstructor
public class MachineTypeController {

    private final MachineTypeService machineTypeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MachineTypeResponse>>> getAllMachineTypes() {
        List<MachineTypeResponse> machineTypes = machineTypeService.getAllMachineTypes();
        return ResponseUtil.success(machineTypes, "Lấy danh sách loại máy thành công");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MachineTypeResponse>> getMachineTypeById(@PathVariable Long id) {
        MachineTypeResponse machineType = machineTypeService.getMachineTypeById(id);
        return ResponseUtil.success(machineType, "Lấy loại máy thành công");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createMachineType(@RequestBody MachineTypeRequest request) {
        machineTypeService.createMachineType(request);
        return ResponseUtil.success(null, "Tạo loại máy thành công");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updateMachineType(@PathVariable Long id,
            @RequestBody MachineTypeRequest request) {
        machineTypeService.updateMachineType(id, request);
        return ResponseUtil.success(null, "Cập nhật loại máy thành công");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMachineType(@PathVariable Long id) {
        machineTypeService.deleteMachineType(id);
        return ResponseEntity.noContent().build();
    }

}
