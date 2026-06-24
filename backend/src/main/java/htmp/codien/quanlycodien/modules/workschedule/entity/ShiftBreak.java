package htmp.codien.quanlycodien.modules.workschedule.entity;

import java.time.LocalTime;

import htmp.codien.quanlycodien.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "shift_breaks")
public class ShiftBreak extends BaseEntity {
    @Column(name = "break_type", nullable = false, length = 20)
    String breakType;

    @Column(name = "start_time", nullable = false)
    LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    LocalTime endTime;

    @Column(name = "duration")
    Integer duration;

    @Column(name = "is_paid")
    Boolean isPaid;

    @ManyToOne
    @JoinColumn(name = "shift_id", nullable = false)
    Shift shift;
}