package htmp.codien.quanlycodien.modules.order.controller;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.modules.order.dto.OrderDTO;
import htmp.codien.quanlycodien.modules.order.dto.OrderItemDTO;
import htmp.codien.quanlycodien.modules.order.dto.OrderItemUpdateDTO;
import htmp.codien.quanlycodien.modules.order.service.OrderService;
import io.jsonwebtoken.io.IOException;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getAllOrder() {
        List<OrderDTO> orderDTOs = orderService.findAll();
        return ResponseUtil.success(orderDTOs, "Lấy danh sách đơn đặt hàng thành công");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<List<OrderItemDTO>>> getAllOrderItem(
            @PathVariable("id") Long orderId) {
        List<OrderItemDTO> orderItemDTOs = orderService.getAllOrderItem(orderId);
        return ResponseUtil.success(orderItemDTOs, "Lấy danh sách đơn đặt hàng thành công");
    }

    @GetMapping("/template")
    public ResponseEntity<ClassPathResource> downloadTemplate() throws IOException {
        ClassPathResource resource = new ClassPathResource("templates/order-item-template.xlsx");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=order-item-template.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @PostMapping("/create-from-excel")
    public ResponseEntity<ApiResponse<Void>> createOrderFromExcel(
            @RequestParam String documentNumber,
            @RequestParam Long employeeId,
            @RequestParam String orderDate,
            @RequestParam(required = false) String note,
            @RequestPart("file") MultipartFile file) {
        try {
            orderService.createOrderFromExcel(documentNumber, employeeId, LocalDate.parse(orderDate), note, file);
            return ResponseUtil.success(null, "Tạo đơn hàng từ Excel thành công");
        } catch (ResourceNotFoundException e) {
            return ResponseUtil.notFound(e.getMessage());
        } catch (Exception e) {
            return ResponseUtil.badRequest("Lỗi khi tạo đơn hàng từ Excel: " + e.getMessage());
        }
    }

    @PatchMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<Void>> updateOrderItem(
            @PathVariable Long itemId, @RequestBody OrderItemUpdateDTO orderItemUpdateDTO) {
        try {
            orderService.updateOrderItem(itemId, orderItemUpdateDTO);
            return ResponseUtil.success(null, "Cập nhật đơn hàng thành công");
        } catch (ResourceNotFoundException e) {
            return ResponseUtil.notFound(e.getMessage());
        } catch (Exception e) {
            return ResponseUtil.badRequest("Lỗi khi cập nhật đơn hàng: " + e.getMessage());
        }
    }

    @GetMapping("/items/{materialCode}")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getOrderByMaterialCode(
            @PathVariable String materialCode) {
        try {
            List<OrderDTO> orderDTOs = orderService.getOrderByMaterialCode(materialCode);
            return ResponseUtil.success(orderDTOs, "Cập nhật đơn hàng thành công");
        } catch (ResourceNotFoundException e) {
            return ResponseUtil.notFound(e.getMessage());
        } catch (Exception e) {
            return ResponseUtil.badRequest("Lỗi khi cập nhật đơn hàng: " + e.getMessage());
        }
    }
}