package htmp.codien.quanlycodien.modules.newmodel.bomlist.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.common.enums.HtmpResult;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.newmodel.productModel.entity.Model;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
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
@Table(name = "bom_lists")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BomList extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", nullable = false)
    @JsonIgnore
    Model model;

    @Column(name = "phase", length = 100, nullable = false)
    String phase;

    @Column(name = "version")
    Integer version;

    @Column(name = "file_url", length = 255)
    String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "check_result", length = 20)
    HtmpResult checkResult;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "check_by")
    @JsonIgnore
    Employee checkedBy;

    @Column(name = "check_at")
    LocalDateTime checkAt;

    @Column(name = "content", columnDefinition = "TEXT")
    String content;

    @Column(name = "approval_at")
    LocalDateTime approvalAt;

    @Column(name = "is_approve")
    Boolean isApprove;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approval_by")
    @JsonIgnore
    Employee approvedBy;
}
