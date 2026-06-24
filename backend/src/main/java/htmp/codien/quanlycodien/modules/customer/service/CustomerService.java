package htmp.codien.quanlycodien.modules.customer.service;

import java.util.List;

import htmp.codien.quanlycodien.modules.customer.dto.CustomerDTO;

public interface CustomerService {
    List<CustomerDTO> getAll();

    CustomerDTO getById(Long id);

    CustomerDTO create(CustomerDTO dto);

    CustomerDTO update(Long id, CustomerDTO dto);

    void delete(Long id);

    List<CustomerDTO> search(String param);
}
