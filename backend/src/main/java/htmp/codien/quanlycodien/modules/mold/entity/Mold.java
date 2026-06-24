package htmp.codien.quanlycodien.modules.mold.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.common.enums.HtmpStatus;
import htmp.codien.quanlycodien.modules.newmodel.product.entity.Product;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
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
@Table(name = "molds")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Mold extends BaseEntity {

    @Column(name = "code", length = 50, unique = true)
    String code;

    @Column(name = "type", length = 50)
    String type;

    @Column(name = "factory", length = 255)
    String factory;

    @Column(name = "expected_start_date")
    LocalDate expectedStartDate;

    @Column(name = "expected_end_date")
    LocalDate expectedEndDate;

    @Column(name = "num_repair", nullable = true)
    Integer numRepair;

    @Enumerated(EnumType.STRING)
    @Column(length = 5)
    HtmpStatus status;

    @OneToMany(mappedBy = "mold", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Product> products = new ArrayList<>();
}