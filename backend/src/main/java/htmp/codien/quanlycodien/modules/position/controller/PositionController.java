package htmp.codien.quanlycodien.modules.position.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.modules.position.dto.PositionDTO;
import htmp.codien.quanlycodien.modules.position.service.PositionService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequestMapping("/api/positions")
@RequiredArgsConstructor
public class PositionController {
    private final PositionService positionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PositionDTO>>> getAllPositions() {
        List<PositionDTO> positionDTOs = positionService.getAllPositions();
        return ResponseUtil.success(positionDTOs, "Lấy danh sách vị trí thành công");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PositionDTO>> getMethodName(@PathVariable Long id) {
        PositionDTO positionDTO = positionService.getPositionById(id);
        return ResponseUtil.success(positionDTO, "Lấy vị trí thành công");
    }

    @PostMapping()
    public ResponseEntity<ApiResponse<Void>> createPosition(@RequestBody PositionDTO positionDTO) {
        positionService.createPosition(positionDTO);
        return ResponseUtil.success(null, "Tạo vị trí thành công");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updatePosition(@PathVariable Long id,
            @RequestBody PositionDTO positionDTO) {
        positionService.updatePosition(id, positionDTO);
        return ResponseUtil.success(null, "Cập nhật vị trí thành công");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePosition(@PathVariable Long id) {
        positionService.deletePosition(id);
        return ResponseUtil.success(null, "Xóa vị trí thành công");
    }
}