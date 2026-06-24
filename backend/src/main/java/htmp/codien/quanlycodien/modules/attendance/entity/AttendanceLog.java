package htmp.codien.quanlycodien.modules.attendance.entity;

import java.time.LocalDateTime;

import htmp.codien.quanlycodien.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "attendance_logs", uniqueConstraints = {
        @UniqueConstraint(name = "uk_attendance_unique", columnNames = { "machine_employee_id", "device_ip",
                "log_time" })
})
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AttendanceLog extends BaseEntity {
    @Column(name = "device_ip", length = 10)
    String deviceIp;

    @Column(name = "machine_employee_id")
    Long machineEmployeeId;

    @Column(name = "log_time", nullable = false)
    LocalDateTime logTime;
}