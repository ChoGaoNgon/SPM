package htmp.codien.quanlycodien.modules.newmodel.mp.entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import htmp.codien.quanlycodien.common.BaseEntity;
import htmp.codien.quanlycodien.common.enums.HtmpResult;
import htmp.codien.quanlycodien.modules.department.entity.Department;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.newmodel.productModel.enums.MPTypeCheck;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "product_mp_check_items")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductMpCheckItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_mp_check_list_id")
    @JsonIgnore
    ProductMpCheckList productMpCheckList;

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

    @Column(name = "result_by_responsibility_1")
    @Enumerated(EnumType.STRING)
    HtmpResult resultByResponsibility1;

    @Column(name = "result_by_responsibility_2")
    @Enumerated(EnumType.STRING)
    HtmpResult resultByResponsibility2;

    @Column(name = "final_result")
    @Enumerated(EnumType.STRING)
    HtmpResult finalResult;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assign_employee_id")
    Employee assignedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receive_employee_id")
    Employee receivedBy;

    @Column(name = "remark", columnDefinition = "TEXT")
    String remark;

    @OneToMany(mappedBy = "productMpCheckItem", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE, orphanRemoval = true)
    @Builder.Default
    private List<ProductMpFile> productMpFiles = new ArrayList<>();
}