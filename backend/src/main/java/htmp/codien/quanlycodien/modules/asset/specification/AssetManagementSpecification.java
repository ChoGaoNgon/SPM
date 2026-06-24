package htmp.codien.quanlycodien.modules.asset.specification;

import org.springframework.data.jpa.domain.Specification;

import htmp.codien.quanlycodien.modules.asset.entity.Asset;
import htmp.codien.quanlycodien.modules.asset.entity.AssetAssignment;
import htmp.codien.quanlycodien.modules.asset.entity.AssetSpecification;
import htmp.codien.quanlycodien.modules.asset.entity.AssetType;
import htmp.codien.quanlycodien.modules.asset.enums.AssetAssignmentStatus;
import htmp.codien.quanlycodien.modules.department.entity.Department;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;

public class AssetManagementSpecification {

    public static Specification<Asset> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return null;
            }

            String kw = "%" + keyword.toLowerCase() + "%";

            Join<Asset, AssetSpecification> assetSpecificationJoin = root.join("assetSpecification", JoinType.LEFT);

            return cb.or(
                    cb.like(cb.lower(root.get("code")), kw),
                    cb.like(cb.lower(root.get("name")), kw),
                    cb.like(cb.lower(root.get("description")), kw),
                    cb.like(cb.function("DATE_FORMAT", String.class, root.get("purchaseDate"), cb.literal("%Y-%m-%d")),
                            kw),

                    cb.like(cb.lower(root.get("model")), kw),
                    cb.like(cb.lower(root.get("position")), kw),
                    cb.like(cb.lower(assetSpecificationJoin.get("ram")), kw),
                    cb.like(cb.lower(assetSpecificationJoin.get("rom")), kw),
                    cb.like(cb.lower(assetSpecificationJoin.get("cpu")), kw),
                    cb.like(cb.lower(assetSpecificationJoin.get("manufacture")), kw),
                    cb.like(cb.lower(assetSpecificationJoin.get("model")), kw));

        };
    }

    public static Specification<Asset> hasAssetTypeId(Long assetTypeId) {
        return (root, query, cb) -> {
            if (assetTypeId == null) {
                return null;
            }
            Join<Asset, AssetType> assetTypeJoin = root.join("assetType", JoinType.INNER);
            return cb.equal(assetTypeJoin.get("id"), assetTypeId);
        };
    }

    public static Specification<Asset> hasDepartmentId(Long departmentId) {
        return (root, query, cb) -> {
            if (departmentId == null) {
                return null;
            }
            Join<Asset, Department> departmentJoin = root.join("department", JoinType.INNER);
            return cb.equal(departmentJoin.get("id"), departmentId);
        };
    }

    public static Specification<Asset> hasEmployeeUseId(Long employeeUseId) {
        return (root, query, cb) -> {
            if (employeeUseId == null) {
                return null;
            }
            Join<Asset, AssetAssignment> assignmentJoin = root.join("assetAssignments", JoinType.INNER);
            Join<AssetAssignment, Employee> employeeJoin = assignmentJoin.join("employeeUse", JoinType.INNER);

            return cb.and(
                    cb.equal(employeeJoin.get("id"), employeeUseId),
                    cb.isNull(assignmentJoin.get("returnAt")));
        };
    }

    public static Specification<Asset> hasStatus(AssetAssignmentStatus status) {
        return (root, query, cb) -> {
            if (status == null) {
                return null;
            }
            return cb.equal(root.get("status"), status);
        };
    }

}
