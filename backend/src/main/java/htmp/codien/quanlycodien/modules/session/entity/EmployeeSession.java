package htmp.codien.quanlycodien.modules.session.entity;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "employee_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(callSuper = true)
public class EmployeeSession extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    Employee employee;

    @Column(name = "token", nullable = false, length = 500, unique = true)
    String token;

    @Column(name = "device_info")
    String deviceInfo;

    @Column(name = "ip_address", length = 100)
    String ipAddress;

    @Column(name = "expired_at")
    LocalDateTime expiredAt;

    @Column(name = "active", nullable = false)
    boolean active;
}