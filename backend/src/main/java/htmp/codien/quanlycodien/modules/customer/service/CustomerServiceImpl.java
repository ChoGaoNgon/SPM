package htmp.codien.quanlycodien.modules.customer.service;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import htmp.codien.quanlycodien.common.exception.ConflictException;
import htmp.codien.quanlycodien.common.exception.ResourceNotFoundException;
import htmp.codien.quanlycodien.modules.customer.dto.CustomerDTO;
import htmp.codien.quanlycodien.modules.customer.entity.Customer;
import htmp.codien.quanlycodien.modules.customer.repository.CustomerRepository;
import htmp.codien.quanlycodien.modules.newmodel.productModel.repository.ModelRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {
    private final CustomerRepository customerRepository;
    private final ModelRepository modelRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<CustomerDTO> getAll() {
        List<Customer> customers = customerRepository.findAll();
        return customers.stream()
                .map(customer -> modelMapper.map(customer, CustomerDTO.class))
                .toList();
    }

    @Override
    public CustomerDTO getById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng"));
        return modelMapper.map(customer, CustomerDTO.class);
    }

    @Override
    public CustomerDTO create(CustomerDTO dto) {
        Customer customer = modelMapper.map(dto, Customer.class);
        Boolean exists = customerRepository.existsByName(dto.getName());
        if (exists) {
            throw new ConflictException("Khách hàng đã tồn tại");
        }
        customerRepository.save(customer);
        return dto;
    }

    @Override
    public CustomerDTO update(Long id, CustomerDTO dto) {
        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng để cập nhật"));

        boolean exists = customerRepository
                .existsByNameAndIdNot(dto.getName(), id);

        if (exists) {
            throw new ConflictException("Khách hàng đã tồn tại");
        }

        existingCustomer.setName(dto.getName());

        customerRepository.save(existingCustomer);
        return modelMapper.map(existingCustomer, CustomerDTO.class);
    }

    @Override
    public void delete(Long id) {

        if (modelRepository.countByCustomerId(id) > 0) {
            throw new IllegalStateException("Không thể xóa khách hàng đã có dự án");
        }
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng để xóa"));
        customerRepository.delete(customer);
    }

    @Override
    public List<CustomerDTO> search(String param) {
        List<Customer> customers = customerRepository.findByNameContainingIgnoreCase(param);
        return customers.stream()
                .map(customer -> modelMapper.map(customer, CustomerDTO.class))
                .toList();
    }

}
