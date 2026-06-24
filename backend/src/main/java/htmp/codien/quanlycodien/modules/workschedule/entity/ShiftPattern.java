package htmp.codien.quanlycodien.modules.workschedule.entity;

import htmp.codien.quanlycodien.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "shift_patterns")
public class ShiftPattern extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true, length = 20)
    String code;

    @Column(name = "name", nullable = false, length = 100)
    String name;

    @Column(name = "pattern", nullable = false, length = 50)
    String pattern;

    @Column(name = "default_shift", nullable = false, length = 20)
    String defaultShift;

    @Column(name = "is_active")
    Boolean isActive;

    @Column(name = "display_order")
    Integer displayOrder;
}
