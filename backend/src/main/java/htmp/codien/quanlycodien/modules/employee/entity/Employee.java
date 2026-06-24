package htmp.codien.quanlycodien.modules.employee.entity;

import java.time.LocalDate;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.modules.department.entity.Department;
import htmp.codien.quanlycodien.modules.employee.enums.EmployeeStatus;
import htmp.codien.quanlycodien.modules.employee.enums.EmployeeType;
import htmp.codien.quanlycodien.modules.employee.enums.Gender;
import htmp.codien.quanlycodien.modules.position.entity.Position;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "employees")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Employee extends BaseEntity {
    @Column(name = "code", length = 50, unique = true, nullable = false)
    String code;

    @Column(name = "name", length = 255, nullable = false)
    String name;

    @Column(name = "phone", length = 50, unique = true, nullable = false)
    String phone;

    @Column(name = "email", length = 100, unique = true, nullable = false)
    String email;

    @Column(name = "password", length = 255, nullable = false)
    String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 50, nullable = false)
    @Builder.Default
    Role role = Role.EMPLOYEE;

    @Enumerated(EnumType.STRING)
    @Column(name = "employee_type", length = 50, nullable = false)
    @Builder.Default
    EmployeeType employeeType = EmployeeType.DIRECT;

    @Column(name = "date_of_birth")
    LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 20, nullable = false)
    Gender gender;

    @Column(name = "date_of_joining")
    LocalDate dateOfJoining;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id")
    Position position;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    EmployeeStatus status;

    @Column(name = "machine_employee_id")
    Long machineEmployeeId;

    public Employee(Long id) {
        this.setId(id);
    }
}