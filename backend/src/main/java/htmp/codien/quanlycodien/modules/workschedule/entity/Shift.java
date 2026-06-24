package htmp.codien.quanlycodien.modules.workschedule.entity;

import java.time.LocalTime;

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
@Table(name = "shifts")
public class Shift extends BaseEntity {
    @Column(name = "shift_code", nullable = false, unique = true, length = 10)
    String shiftCode;

    @Column(name = "code_hcns", nullable = false, unique = true, length = 10)
    String codeHcns;

    @Column(name = "description", nullable = false, length = 255)
    String description;

    @Column(name = "start_time")
    LocalTime startTime;

    @Column(name = "end_time")
    LocalTime endTime;

    @Column(name = "day_factor")
    Double dayFactor;

    @Column(name = "night_factor")
    Double nightFactor;

    public Shift(Long id) {
        this.setId(id);
    }
}