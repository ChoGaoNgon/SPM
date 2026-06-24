package htmp.codien.quanlycodien.modules.mail.service;

import java.util.List;
import java.util.Optional;

import htmp.codien.quanlycodien.modules.mail.dto.MailAddressDTO;

public interface MailAddressService {
    MailAddressDTO create(MailAddressDTO dto);

    List<MailAddressDTO> getAll();

    Optional<MailAddressDTO> getById(Long id);

    Optional<MailAddressDTO> getByEmail(String email);

    List<MailAddressDTO> getByDepartmentId(Long departmentId);

    List<MailAddressDTO> getAllActive();

    List<String> getEmailsByDepartmentCodes(List<String> departmentCodes);

    MailAddressDTO update(Long id, MailAddressDTO dto);

    void deleteById(Long id);

    boolean existsByEmail(String email);
}
