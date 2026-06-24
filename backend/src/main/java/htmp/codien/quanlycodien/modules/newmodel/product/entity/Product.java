package htmp.codien.quanlycodien.modules.newmodel.product.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.modules.mold.entity.Mold;
import htmp.codien.quanlycodien.modules.newmodel.mapping.entity.ProductResinMapping;
import htmp.codien.quanlycodien.modules.newmodel.mp.entity.ProductMpCheckList;
import htmp.codien.quanlycodien.modules.newmodel.plan.entity.ProductPlan;
import htmp.codien.quanlycodien.modules.newmodel.product.enums.ProductStatus;
import htmp.codien.quanlycodien.modules.newmodel.productEvent.entity.ProductEventRequirement;
import htmp.codien.quanlycodien.modules.newmodel.productModel.entity.Model;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductCategory;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductMarketType;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.ProductNmdInfoStatus;
import htmp.codien.quanlycodien.modules.newmodel.productTool.entity.ProductToolPreparationItem;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "products")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Product extends BaseEntity {
    @Column(name = "code", length = 50)
    String code;

    @Column(name = "name", length = 255)
    String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "model_id")
    Model model;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mold_id", nullable = true)
    Mold mold;

    @Enumerated(EnumType.STRING)
    @Column(name = "market_type", length = 20)
    ProductMarketType marketType;

    @Column(name = "lifecycle_year", nullable = true)
    Integer lifecycleYear;

    @Column(name = "monthly_output")
    Integer monthlyOutput;

    @Column(name = "moq")
    Integer moq;

    @Column(name = "mdq")
    Integer mdq;

    @Column(name = "info_received_date")
    LocalDate infoReceivedDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "nmd_info_status", length = 20)
    ProductNmdInfoStatus nmdInfoStatus;

    @Column(name = "nmd_info_confirmed_by", length = 100)
    String nmdInfoConfirmedBy;

    @Column(name = "nmd_info_note", columnDefinition = "TEXT")
    String nmdInfoNote;

    @Column(name = "mp_target_date", length = 50)
    LocalDate mpTargetDate;

    @Column(name = "mp_delay_reason")
    String mpDelayReason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    ProductStatus status;

    @Builder.Default
    @Column(name = "is_approved_by_head_kd")
    Boolean isApprovedByHeadKD = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_category", length = 30)
    ProductCategory productCategory;

    @Column(columnDefinition = "TEXT")
    String remark;

    @Column(name = "file_url", length = 255)
    String fileUrl;

    @Column(name = "image", length = 255, nullable = true)
    String image;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<ProductToolPreparationItem> toolPreparationItems = new ArrayList<>();

    @Column(name = "Htmp_resin")
    String htmpResin;

    @OneToOne(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    ProductPacking productPacking;

    @OneToOne(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    ProductMachine productMachine;

    @OneToOne(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    ProductMoldDepreciation productMoldDepreciation;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    List<ProductInsert> productInserts;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<ProductMaterial> productMaterials = new ArrayList<>();

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    @Builder.Default
    List<ProductResinMapping> ProductResinMappings = new ArrayList<>();

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<ProductPlan> productPlans = new ArrayList<>();

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<ProductEventRequirement> productEventRequirements = new ArrayList<>();

    @OneToOne(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    ProductMpCheckList productMpCheckList;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    List<ProductFile> files = new ArrayList<>();

}