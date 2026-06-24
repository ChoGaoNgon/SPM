package htmp.codien.quanlycodien.modules.customer.controller;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.ResponseUtil;
import htmp.codien.quanlycodien.common.annotation.RequiresPermission;
import htmp.codien.quanlycodien.modules.customer.dto.CustomerDTO;
import htmp.codien.quanlycodien.modules.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerDTO>>> getAllCustomers() {
        List<CustomerDTO> customerList = customerService.getAll();
        return ResponseUtil.success(customerList, "Lấy danh sách khách hàng thành công");
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<ApiResponse<CustomerDTO>> getCustomerById(@PathVariable Long id) {
        CustomerDTO customer = customerService.getById(id);
        return ResponseUtil.success(customer, "Lấy thông tin khách hàng thành công");
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CustomerDTO>>> searchCustomers(@RequestParam String param) {
        List<CustomerDTO> customers = customerService.search(param);
        return ResponseUtil.success(customers, "Tìm kiếm khách hàng thành công");
    }

    @PostMapping
    @RequiresPermission("CUSTOMER_CREATE")
    public ResponseEntity<ApiResponse<CustomerDTO>> createCustomer(@RequestBody CustomerDTO dto) {
        CustomerDTO created = customerService.create(dto);
        return ResponseUtil.success(created, "Tạo khách hàng thành công");
    }

    @PutMapping("/{id}")
    @RequiresPermission("CUSTOMER_UPDATE")
    public ResponseEntity<ApiResponse<CustomerDTO>> updateCustomer(@PathVariable Long id,
            @RequestBody CustomerDTO dto) {
        CustomerDTO updated = customerService.update(id, dto);
        return ResponseUtil.success(updated, "Cập nhật khách hàng thành công");
    }

    @DeleteMapping("/{id}")
    @RequiresPermission("CUSTOMER_DELETE")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseUtil.success(null, "Xóa khách hàng thành công");
    }

}
