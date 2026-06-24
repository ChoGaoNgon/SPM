package htmp.codien.quanlycodien.modules.position.entity;

import java.util.ArrayList;
import java.util.List;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "position")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Position extends BaseEntity {
    @Column(name = "code", length = 20, nullable = false, unique = true)
    String code;

    @Column(name = "name", length = 255, nullable = false)
    String name;

    @Column(name = "level", nullable = false)
    Integer level;

    @OneToMany(mappedBy = "position")
    @Builder.Default
    List<Employee> employees = new ArrayList<>();
}