package htmp.codien.quanlycodien.modules.newmodel.mp.entity;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.department.entity.Department;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.MPTypeCheck;
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
@Table(name = "product_mp_check_item_templates")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductMpCheckItemTemplate extends BaseEntity {
    @Column(name = "type", length = 255)
    @Enumerated(EnumType.STRING)
    MPTypeCheck type;

    @Column(name = "name", length = 255)
    String name;

    @Column(name = "request_content", columnDefinition = "TEXT")
    String requestContent;

    @Column(name = "standard", columnDefinition = "TEXT")
    String standard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsibility_1")
    Department responsibility1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsibility_2")
    Department responsibility2;

    @Column(name = "is_active")
    @Builder.Default
    Boolean isActive = true;
}