package htmp.codien.quanlycodien.modules.asset.entity;

import java.time.LocalDate;
import java.util.List;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.asset.enums.AssetAssignmentStatus;
import htmp.codien.quanlycodien.modules.department.entity.Department;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "assets")
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Asset extends BaseEntity {

    String name;

    String code;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    AssetAssignmentStatus status = AssetAssignmentStatus.AVAILABLE;

    String description;

    LocalDate purchaseDate;

    String position;

    String model;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_type_id", nullable = false)
    AssetType assetType;

    @OneToOne(mappedBy = "asset", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = true)
    AssetSpecification assetSpecification;

    @OneToMany(mappedBy = "asset", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<AssetAssignment> assetAssignments;

}
