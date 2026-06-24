package htmp.codien.quanlycodien.modules.mail.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import htmp.codien.quanlycodien.modules.mail.entity.MailAddress;

import java.util.List;
import java.util.Optional;

@Repository
public interface MailAddressRepository extends JpaRepository<MailAddress, Long> {
    Optional<MailAddress> findByEmail(String email);

    List<MailAddress> findByDepartmentId(Long departmentId);

    List<MailAddress> findByActiveTrue();

    List<MailAddress> findAllByIdIn(List<Long> mailIds);

    @Query("SELECT m.email FROM MailAddress m WHERE m.department.code IN :departmentCodes AND m.active = true")
    List<String> findEmailsByDepartmentCodes(@Param("departmentCodes") List<String> departmentCodes);
}
