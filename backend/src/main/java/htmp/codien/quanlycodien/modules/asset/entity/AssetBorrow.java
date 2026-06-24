package htmp.codien.quanlycodien.modules.asset.entity;

import java.time.LocalDateTime;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.asset.enums.AssetBorrowStatus;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
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
@Table(name = "assets_borrow")
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AssetBorrow extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_id", nullable = false)
    Employee requestedBy;

    @Enumerated(EnumType.STRING)
    @JoinColumn(name = "status", nullable = true)
    AssetBorrowStatus status;

    String purpose;

    LocalDateTime borrowAt;

    LocalDateTime expectedReturnAt;
    LocalDateTime actualReturnAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_id", nullable = true)
    Employee approvedBy;

    LocalDateTime approvedAt;

    String remark;

}
