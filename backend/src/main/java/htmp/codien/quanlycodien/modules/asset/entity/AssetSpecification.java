package htmp.codien.quanlycodien.modules.asset.entity;

import htmp.codien.quanlycodien.common.BaseEntity;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "asset_specifications")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AssetSpecification extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false, unique = true)
    @JsonIgnore
    Asset asset;

    String ram;
    String rom;
    String cpu;
    String manufacture;
    String dimension;
    Double weight;
    String color;
    String material;
    String ipAddress;
    String username;
    String password;
    String email;

    String size;

}
