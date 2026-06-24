package htmp.codien.quanlycodien.modules.session.repository;

import htmp.codien.quanlycodien.modules.auth.dto.ActiveSessionDTO;
import htmp.codien.quanlycodien.modules.session.entity.EmployeeSession;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface EmployeeSessionRepository extends JpaRepository<EmployeeSession, Long> {

  Optional<EmployeeSession> findByTokenAndActiveTrue(String token);

  List<EmployeeSession> findByEmployeeIdAndActiveTrue(Long employeeId);

  @Query("""
      SELECT new htmp.codien.quanlycodien.modules.auth.dto.ActiveSessionDTO(
          es.id,
          e.id,
          e.code,
          e.name,
          es.ipAddress,
          es.deviceInfo,
          es.createdAt,
          es.expiredAt,
          es.active
      )
      FROM EmployeeSession es
      JOIN es.employee e
      WHERE es.active = true
        AND es.expiredAt > CURRENT_TIMESTAMP
      ORDER BY es.createdAt DESC
      """)
  List<ActiveSessionDTO> findActiveSessions();

  void deleteByEmployeeId(Long employeeId);
}