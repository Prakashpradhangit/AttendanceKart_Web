package com.Kart.Attendance.Service;

import com.Kart.Attendance.Entity.Admin;
import com.Kart.Attendance.Entity.SuperAdmin;
import com.Kart.Attendance.Entity.User;
import com.Kart.Attendance.Repository.AdminRepository;
import com.Kart.Attendance.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminRepository adminRepository;
    private final com.Kart.Attendance.Repository.SuperAdminRepository superAdminRepository;
    private final UserRepository userRepository;

    public Map<String, String> login(String email, String password) {
        
        Optional<SuperAdmin> superAdminOpt = superAdminRepository.findByEmail(email);
        if (superAdminOpt.isPresent()) {
            SuperAdmin superAdmin = superAdminOpt.get();
            if (password != null && password.equals(superAdmin.getPassword())) {
                String token = UUID.randomUUID().toString();
                superAdmin.setAuthToken(token);
                superAdminRepository.save(superAdmin);

                return Map.of(
                    "message", "Super Admin Login successful",
                    "role", "SUPER_ADMIN",
                    "name", superAdmin.getName() != null ? superAdmin.getName() : "Super Admin",
                    "token", token
                );
            }
        }

        Optional<Admin> adminOpt = adminRepository.findByEmail(email);

        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            // Basic password check for now (should use password hashing in production)
            if (password != null && password.equals(admin.getPassword())) {
                String token = java.util.UUID.randomUUID().toString();
                admin.setAuthToken(token);
                adminRepository.save(admin);

                return Map.of(
                    "message", "Login successful",
                    "tenantId", admin.getTenantId() != null ? admin.getTenantId() : "super_admin",
                    "organization", admin.getOrganisation_name() != null ? admin.getOrganisation_name() : "",
                    "role", "ADMIN",
                    "token", token
                );
            }
        }

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (password != null && password.equals(user.getPassword())) {
                String token = UUID.randomUUID().toString();
                user.setAuthToken(token);
                userRepository.save(user);

                return Map.of(
                    "message", "User Login successful",
                    "role", "USER",
                    "userRole", user.getRole() != null ? user.getRole().name() : "",
                    "tenantId", user.getTenantId() != null ? user.getTenantId() : "",
                    "name", user.getName() != null ? user.getName() : "",
                    "email", user.getEmail() != null ? user.getEmail() : "",
                    "employeeCode", user.getEmployeeCode() != null ? user.getEmployeeCode() : "",
                    "token", token
                );
            }
        }
        
        return null; // Return null if login fails
    }

    public void logout(String token) {
        if (token == null || token.isBlank()) {
            return;
        }

        superAdminRepository.findByAuthToken(token).ifPresent(superAdmin -> {
            superAdmin.setAuthToken(null);
            superAdminRepository.save(superAdmin);
        });

        adminRepository.findByAuthToken(token).ifPresent(admin -> {
            admin.setAuthToken(null);
            adminRepository.save(admin);
        });

        userRepository.findByAuthToken(token).ifPresent(user -> {
            user.setAuthToken(null);
            userRepository.save(user);
        });
    }

    public Map<String, String> getSession(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }

        Optional<SuperAdmin> superAdminOpt = superAdminRepository.findByAuthToken(token);
        if (superAdminOpt.isPresent()) {
            return Map.of(
                    "role", "SUPER_ADMIN",
                    "token", token
            );
        }

        Optional<Admin> adminOpt = adminRepository.findByAuthToken(token);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            return Map.of(
                    "role", "ADMIN",
                    "token", token,
                    "tenantId", admin.getTenantId() != null ? admin.getTenantId() : "",
                    "organization", admin.getOrganisation_name() != null ? admin.getOrganisation_name() : ""
            );
        }

        Optional<User> userOpt = userRepository.findByAuthToken(token);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return Map.of(
                    "role", "USER",
                    "token", token,
                    "userRole", user.getRole() != null ? user.getRole().name() : "",
                    "tenantId", user.getTenantId() != null ? user.getTenantId() : "",
                    "name", user.getName() != null ? user.getName() : "",
                    "email", user.getEmail() != null ? user.getEmail() : "",
                    "employeeCode", user.getEmployeeCode() != null ? user.getEmployeeCode() : ""
            );
        }

        return null;
    }

    public Map<String, Object> getProfile(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }

        Optional<SuperAdmin> superAdminOpt = superAdminRepository.findByAuthToken(token);
        if (superAdminOpt.isPresent()) {
            SuperAdmin sa = superAdminOpt.get();
            return Map.of(
                    "role", "SUPER_ADMIN",
                    "name", sa.getName() != null ? sa.getName() : "Super Admin",
                    "email", sa.getEmail() != null ? sa.getEmail() : ""
            );
        }

        Optional<Admin> adminOpt = adminRepository.findByAuthToken(token);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            return Map.of(
                    "role", "ADMIN",
                    "name", admin.getName() != null ? admin.getName() : "Admin",
                    "email", admin.getEmail() != null ? admin.getEmail() : "",
                    "organization", admin.getOrganisation_name() != null ? admin.getOrganisation_name() : "",
                    "tenantId", admin.getTenantId() != null ? admin.getTenantId() : ""
            );
        }

        Optional<User> userOpt = userRepository.findByAuthToken(token);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return Map.of(
                    "role", "USER",
                    "name", user.getName() != null ? user.getName() : "",
                    "email", user.getEmail() != null ? user.getEmail() : "",
                    "employeeCode", user.getEmployeeCode() != null ? user.getEmployeeCode() : "",
                    "department", user.getDepartment() != null ? user.getDepartment() : "",
                    "designation", user.getDesignation() != null ? user.getDesignation() : "",
                    "tenantId", user.getTenantId() != null ? user.getTenantId() : ""
            );
        }

        return null;
    }
}
