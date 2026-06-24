package htmp.codien.quanlycodien.common.util;

import java.util.Collection;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.infrastructure.security.CustomUserDetails;
import htmp.codien.quanlycodien.modules.department.entity.Department;
import htmp.codien.quanlycodien.modules.employee.entity.Employee;

public class SecurityUtils {
    public static Long getCurrentEmployeeId() {
        Employee employee = getCurrentEmployee();
        return employee != null ? employee.getId() : null;
    }

    public static Department getCurrentDepartment() {
        Employee employee = getCurrentEmployee();

        return employee != null ? employee.getDepartment() : null;
    }

    public static Long getCurrentDepartmentId() {
        Department dept = getCurrentDepartment();
        return dept != null ? dept.getId() : null;
    }

    public static String getCurrentDepartmentCode() {
        Department dept = getCurrentDepartment();
        return dept != null ? dept.getCode() : null;
    }

    public static String getCurrentDepartmentName() {
        Department dept = getCurrentDepartment();
        return dept != null ? dept.getName() : null;
    }

    public static Employee getCurrentEmployee() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            return ((CustomUserDetails) principal).getEmployee();
        }
        return null;
    }

    public static String getCurrentEmployeeRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        if (authorities != null && !authorities.isEmpty()) {

            return authorities.iterator().next().getAuthority();
        }
        return null;
    }

    public static boolean hasRole(Role role) {
        String currentRole = getCurrentEmployeeRole();
        if (currentRole.startsWith("ROLE_")) {
            currentRole = currentRole.replace("ROLE_", "");
        }
        return currentRole != null && currentRole.equalsIgnoreCase(role.name());
    }

    public static boolean hasDepartmentCode(String departmentCode) {
        Department dept = getCurrentDepartment();
        return dept != null && dept.getCode().equals(departmentCode);
    }
}