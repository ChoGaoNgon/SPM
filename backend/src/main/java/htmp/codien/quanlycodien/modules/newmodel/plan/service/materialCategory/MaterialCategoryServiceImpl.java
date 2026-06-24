package htmp.codien.quanlycodien.modules.newmodel.plan.service.materialCategory;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import htmp.codien.quanlycodien.modules.newmodel.plan.dto.productPlan.suppliesHtmp.SuppliesHTMPDTO;
import htmp.codien.quanlycodien.modules.newmodel.product.dto.ProductResinMappingDTO;

@Service
@ConditionalOnBean(name = "tertiaryJdbcTemplate")
public class MaterialCategoryServiceImpl implements MaterialCategoryService {

    @Autowired
    @Qualifier("tertiaryJdbcTemplate")
    private JdbcTemplate tertiaryJdbcTemplate;

    public MaterialCategoryServiceImpl(
            @Qualifier("tertiaryJdbcTemplate") JdbcTemplate jdbcTemplate) {
        this.tertiaryJdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<ProductResinMappingDTO> getResin(String materialCode) {
        StringBuilder sql = new StringBuilder("""
                    SELECT
                        ma_vt AS code,
                        loai_nhua AS type,
                        xcolor_name AS colorName,
                        grade,
                        ten_vt AS description
                    FROM dmvt
                    WHERE nhua_yn = TRUE
                """);

        List<Object> params = new ArrayList<>();

        if (materialCode != null && !materialCode.isEmpty()) {
            sql.append(" AND ma_vt = ?");
            params.add(materialCode);
        }

        return tertiaryJdbcTemplate.query(sql.toString(), (rs, rowNum) -> ProductResinMappingDTO.builder()
                .code(rs.getString("code"))
                .type(resolveType(rs.getString("type"), rs.getString("description")))
                .colorName(rs.getString("colorName"))
                .grade(rs.getString("grade"))
                .description(rs.getString("description"))
                .build(), params.toArray());

    }

    private String resolveType(String type, String description) {
        if (type != null && !type.trim().isEmpty()) {
            return type;
        }
        if (description == null || description.trim().isEmpty()) {
            return null;
        }

        String firstToken = description.trim().split("\\s+")[0];
        return firstToken.isEmpty() ? null : firstToken;
    }

    @Override
    public List<SuppliesHTMPDTO> getSupplies(String keyword) {
        StringBuilder sql = new StringBuilder("""
                                    SELECT
                    ma_vt AS code,
                    ten_vt AS name,
                    dvt as unit
                FROM dmvt
                WHERE nhua_yn = false
                                """);
        List<Object> params = new ArrayList<>();

        if (keyword != null && !keyword.isEmpty()) {
            sql.append(" AND ma_vt LIKE ?");
            params.add("%" + keyword + "%");
        }

        return tertiaryJdbcTemplate.query(sql.toString(), (rs, rowNum) -> SuppliesHTMPDTO.builder()
                .code(rs.getString("code"))
                .name(rs.getString("name"))
                .unit(rs.getString("unit"))
                .build(), params.toArray());

    }
}
