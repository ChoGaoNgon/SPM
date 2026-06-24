package htmp.codien.quanlycodien.modules.employee.specification;

import org.springframework.data.jpa.domain.Specification;

import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;
import htmp.codien.quanlycodien.modules.employee.enums.EmployeeStatus;
import htmp.codien.quanlycodien.modules.employee.enums.EmployeeType;
import jakarta.persistence.criteria.JoinType;

public class EmployeeSpecification {

    public static Specification<Employee> hasKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            String likePattern = "%" + keyword.toLowerCase() + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("code")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("phone")), likePattern));
        };
    }

    public static Specification<Employee> hasCode(String code) {
        return (root, query, criteriaBuilder) -> {
            if (code == null || code.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("code")), "%" + code.toLowerCase() + "%");
        };
    }

    public static Specification<Employee> hasName(String name) {
        return (root, query, criteriaBuilder) -> {
            if (name == null || name.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + name.toLowerCase() + "%");
        };
    }

    public static Specification<Employee> hasPhone(String phone) {
        return (root, query, criteriaBuilder) -> {
            if (phone == null || phone.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(root.get("phone"), "%" + phone + "%");
        };
    }

    public static Specification<Employee> hasRole(Role role) {
        return (root, query, criteriaBuilder) -> {
            if (role == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("role"), role);
        };
    }

    public static Specification<Employee> hasEmployeeType(EmployeeType employeeType) {
        return (root, query, criteriaBuilder) -> {
            if (employeeType == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("employeeType"), employeeType);
        };
    }

    public static Specification<Employee> hasDepartmentId(Long departmentId) {
        return (root, query, criteriaBuilder) -> {
            if (departmentId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("department").get("id"), departmentId);
        };
    }

    public static Specification<Employee> hasPositionId(Long positionId) {
        return (root, query, criteriaBuilder) -> {
            if (positionId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("position").get("id"), positionId);
        };
    }

    public static Specification<Employee> hasStatus(EmployeeStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }

    public static Specification<Employee> isActive() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("status"), EmployeeStatus.ACTIVE);
    }

    public static Specification<Employee> hasMachineEmployeeId(Long machineEmployeeId) {
        return (root, query, criteriaBuilder) -> {
            if (machineEmployeeId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("machineEmployeeId"), machineEmployeeId);
        };
    }

    public static Specification<Employee> hasDepartmentIds(java.util.List<Long> departmentIds) {
        return (root, query, criteriaBuilder) -> {
            if (departmentIds == null || departmentIds.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return root.get("department").get("id").in(departmentIds);
        };
    }

    public static Specification<Employee> hasPositionIds(java.util.List<Long> positionIds) {
        return (root, query, criteriaBuilder) -> {
            if (positionIds == null || positionIds.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return root.get("position").get("id").in(positionIds);
        };
    }

    public static Specification<Employee> withDepartment() {
        return (root, query, criteriaBuilder) -> {
            if (query != null) {

                Class<?> resultType = query.getResultType();
                if (resultType != null && (resultType.equals(Long.class) || resultType.equals(long.class))) {

                    root.join("department", JoinType.LEFT);
                } else {

                    root.fetch("department", JoinType.LEFT);
                }
                query.distinct(true);
            }
            return criteriaBuilder.conjunction();
        };
    }

    public static Specification<Employee> withPosition() {
        return (root, query, criteriaBuilder) -> {
            if (query != null) {

                Class<?> resultType = query.getResultType();
                if (resultType != null && (resultType.equals(Long.class) || resultType.equals(long.class))) {

                    root.join("position", JoinType.LEFT);
                } else {

                    root.fetch("position", JoinType.LEFT);
                }
                query.distinct(true);
            }
            return criteriaBuilder.conjunction();
        };
    }

    public static Specification<Employee> withFilters(String keyword, Role role,
            EmployeeType employeeType, Long departmentId, Long positionId,
            EmployeeStatus status) {
        Specification<Employee> spec = Specification.allOf();
        spec = spec.and(hasKeyword(keyword));
        spec = spec.and(hasRole(role));
        spec = spec.and(hasEmployeeType(employeeType));
        spec = spec.and(hasDepartmentId(departmentId));
        spec = spec.and(hasPositionId(positionId));
        spec = spec.and(hasStatus(status));
        return spec;
    }
}
