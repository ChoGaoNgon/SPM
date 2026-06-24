package htmp.codien.quanlycodien.infrastructure.interceptor;

import java.util.Arrays;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import htmp.codien.quanlycodien.common.ApiResponse;
import htmp.codien.quanlycodien.common.annotation.RequiresPermission;
import htmp.codien.quanlycodien.common.enums.Role;
import htmp.codien.quanlycodien.infrastructure.security.CustomUserDetails;
import htmp.codien.quanlycodien.modules.permission.service.PermissionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PermissionInterceptor implements HandlerInterceptor {

    private final PermissionService permissionService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
       
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RequiresPermission annotation = handlerMethod.getMethodAnnotation(RequiresPermission.class);

        if (annotation != null) {

            if (SecurityContextHolder.getContext().getAuthentication() == null
                    || !(SecurityContextHolder.getContext().getAuthentication()
                            .getPrincipal() instanceof CustomUserDetails)) {
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

                ApiResponse<?> apiResponse = new ApiResponse<>(401, "Bạn chưa đăng nhập", null);

                ObjectMapper mapper = new ObjectMapper();
                mapper.registerModule(new JavaTimeModule());

                response.getWriter().write(mapper.writeValueAsString(apiResponse));
                return false;
            }

            String[] requiredPerms = annotation.value();
            RequiresPermission.Logical logical = annotation.logical();

            CustomUserDetails user = (CustomUserDetails) SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getPrincipal();

           
            if (user.getEmployee() != null && user.getEmployee().getRole() == Role.SUPERADMIN) {
                return true;
            }

            boolean hasPermission;

            if (logical == RequiresPermission.Logical.AND) {
               
                hasPermission = Arrays.stream(requiredPerms)
                        .allMatch(perm -> permissionService
                                .hasPermission(user.getEmployee(), perm));
            } else {
               
                hasPermission = Arrays.stream(requiredPerms)
                        .anyMatch(perm -> permissionService
                                .hasPermission(user.getEmployee(), perm));
            }

            if (!hasPermission) {
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);

                ApiResponse<?> apiResponse = new ApiResponse<>(403, "Quyền truy cập bị từ chối", null);

                ObjectMapper mapper = new ObjectMapper();
                mapper.registerModule(new JavaTimeModule());

                response.getWriter().write(mapper.writeValueAsString(apiResponse));
                return false;
            }
        }

        return true;
    }
}