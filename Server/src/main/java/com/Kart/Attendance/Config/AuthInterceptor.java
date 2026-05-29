package com.Kart.Attendance.Config;

import com.Kart.Attendance.Entity.Admin;
import com.Kart.Attendance.Entity.User;
import com.Kart.Attendance.Repository.AdminRepository;
import com.Kart.Attendance.Repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Optional;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private com.Kart.Attendance.Repository.SuperAdminRepository superAdminRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        
        // Handle CORS preflight requests
        if (request.getMethod().equals("OPTIONS")) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else {
            token = request.getParameter("token");
        }

        if (token != null) {
            // Validate token against SuperAdmin database
            Optional<com.Kart.Attendance.Entity.SuperAdmin> superAdminOpt = superAdminRepository.findByAuthToken(token);
            if (superAdminOpt.isPresent()) {
                TenantContext.setCurrentTenant("SYSTEM_SUPER_ADMIN");
                request.setAttribute("authenticatedRole", "SUPER_ADMIN");
                request.setAttribute("authenticatedSuperAdminId", superAdminOpt.get().getId());
                return true;
            }

            // Validate token against Admin database
            Optional<Admin> adminOpt = adminRepository.findByAuthToken(token);
            if (adminOpt.isPresent()) {
                Admin admin = adminOpt.get();
                if ("Inactive".equalsIgnoreCase(admin.getStatus())) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"error\": \"Unauthorized - Organization is Inactive\"}");
                    response.setContentType("application/json");
                    return false;
                }
                TenantContext.setCurrentTenant(admin.getTenantId());
                request.setAttribute("authenticatedRole", "ADMIN");
                request.setAttribute("authenticatedAdminId", admin.getId());
                request.setAttribute("authenticatedName", admin.getName());
                return true; // Valid token
            }

            Optional<User> userOpt = userRepository.findByAuthToken(token);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if ("Inactive".equalsIgnoreCase(user.getStatus())) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"error\": \"Unauthorized - User is Inactive\"}");
                    response.setContentType("application/json");
                    return false;
                }
                if (user.getTenantId() != null) {
                    Admin tenantAdmin = adminRepository.findByTenantId(user.getTenantId()).orElse(null);
                    if (tenantAdmin != null && "Inactive".equalsIgnoreCase(tenantAdmin.getStatus())) {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write("{\"error\": \"Unauthorized - Organization is Inactive\"}");
                        response.setContentType("application/json");
                        return false;
                    }
                }
                TenantContext.setCurrentTenant(user.getTenantId());
                request.setAttribute("authenticatedRole", "USER");
                request.setAttribute("authenticatedUserId", user.getId());
                request.setAttribute("authenticatedName", user.getName());
                return true;
            }
        }

        // If no valid token found, return 401
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write("{\"error\": \"Unauthorized - Invalid or missing token\"}");
        response.setContentType("application/json");
        return false;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        TenantContext.clear();
    }
}
