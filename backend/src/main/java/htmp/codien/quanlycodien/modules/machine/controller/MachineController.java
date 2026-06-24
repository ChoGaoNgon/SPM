package htmp.codien.quanlycodien.modules.machine.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.machine.dto.MachineRequest;
import htmp.codien.quanlycodien.modules.machine.dto.MachineResponse;
import htmp.codien.quanlycodien.modules.machine.service.MachineService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/machines")
@RequiredArgsConstructor
public class MachineController {
    private final MachineService machineService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MachineResponse>>> getAllMachines(
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long machineTypeId) {
        Page<MachineResponse> machines = machineService.getAllMachines(pageable, keyword, machineTypeId);
        return ResponseUtil.success(machines, "Lấy danh sách máy thành công");
    }

    @GetMapping("/distinct")
    public ResponseEntity<ApiResponse<List<?>>> getDistinctMachineDetailFieldValues(@RequestParam String field) {
        List<?> values = machineService.getDistinctMachineDetailFieldValues(field);
        return ResponseUtil.success(values, "Lấy danh sách distinct thành công cho field: " + field);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MachineResponse>> getMachineById(@PathVariable Long id) {
        MachineResponse machine = machineService.getMachineById(id);
        return ResponseUtil.success(machine, "Lấy thông tin máy thành công");
    }

    @GetMapping("/by-code")
    public ResponseEntity<ApiResponse<MachineResponse>> getMachineByCode(@RequestParam String code) {
        MachineResponse machine = machineService.getMachineByCode(code);
        return ResponseUtil.success(machine, "Lấy thông tin máy thành công");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createMachine(@RequestBody MachineRequest request) {
        machineService.createMachine(request);
        return ResponseUtil.success(null, "Tạo máy thành công");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updateMachine(@PathVariable Long id,
            @RequestBody MachineRequest request) {
        machineService.updateMachine(id, request);
        return ResponseUtil.success(null, "Cập nhật máy thành công");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMachine(@PathVariable Long id) {
        machineService.deleteMachine(id);
        return ResponseEntity.noContent().build();
    }
}
