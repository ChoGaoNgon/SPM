package htmp.codien.quanlycodien.modules.feedback.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import htmp.codien.quanlycodien.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "system_feedback_files")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SystemFeedbackFile extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "system_feedback_id", nullable = false)
    SystemFeedback systemFeedback;

    @Column(name = "file_path")
    String filePath;
}