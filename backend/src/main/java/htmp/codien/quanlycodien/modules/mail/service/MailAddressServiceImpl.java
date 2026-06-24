package htmp.codien.quanlycodien.modules.mail.service;

import htmp.codien.quanlycodien.modules.department.entity.Department;
import htmp.codien.quanlycodien.modules.department.repository.DepartmentRepository;
import htmp.codien.quanlycodien.modules.mail.dto.MailAddressDTO;
import htmp.codien.quanlycodien.modules.mail.entity.MailAddress;
import htmp.codien.quanlycodien.modules.mail.repository.MailAddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MailAddressServiceImpl implements MailAddressService {
    private final MailAddressRepository mailAddressRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    @Transactional
    public MailAddressDTO create(MailAddressDTO dto) {
        MailAddress mailAddress = MailAddress.builder()
                .email(dto.getEmail())
                .displayName(dto.getDisplayName())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();

        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found with id: " + dto.getDepartmentId()));
            mailAddress.setDepartment(department);
        }

        MailAddress saved = mailAddressRepository.save(mailAddress);
        return convertToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MailAddressDTO> getAll() {
        return mailAddressRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MailAddressDTO> getById(Long id) {
        return mailAddressRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MailAddressDTO> getByEmail(String email) {
        return mailAddressRepository.findByEmail(email)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MailAddressDTO> getByDepartmentId(Long departmentId) {
        return mailAddressRepository.findByDepartmentId(departmentId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MailAddressDTO> getAllActive() {
        return mailAddressRepository.findByActiveTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getEmailsByDepartmentCodes(List<String> departmentCodes) {
        return mailAddressRepository.findEmailsByDepartmentCodes(departmentCodes);
    }

    @Override
    @Transactional
    public MailAddressDTO update(Long id, MailAddressDTO dto) {
        MailAddress mailAddress = mailAddressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mail address not found with id: " + id));

        mailAddress.setEmail(dto.getEmail());
        mailAddress.setDisplayName(dto.getDisplayName());
        mailAddress.setActive(dto.getActive());

        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found with id: " + dto.getDepartmentId()));
            mailAddress.setDepartment(department);
        } else {
            mailAddress.setDepartment(null);
        }

        MailAddress updated = mailAddressRepository.save(mailAddress);
        return convertToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        if (!mailAddressRepository.existsById(id)) {
            throw new RuntimeException("Mail address not found with id: " + id);
        }
        mailAddressRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return mailAddressRepository.findByEmail(email).isPresent();
    }

    private MailAddressDTO convertToDTO(MailAddress entity) {
        return MailAddressDTO.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .displayName(entity.getDisplayName())
                .departmentId(entity.getDepartment() != null ? entity.getDepartment().getId() : null)
                .departmentName(entity.getDepartment() != null ? entity.getDepartment().getName() : null)
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
