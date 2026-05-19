package com.Kart.Attendance.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.Kart.Attendance.Config.TenantContext;
import com.Kart.Attendance.Entity.User;
import com.Kart.Attendance.Repository.UserRepository;
import com.Kart.Attendance.Repository.Attendance_Details;
import com.Kart.Attendance.Repository.LeaveRepository;
import com.Kart.Attendance.Repository.AdminRepository;
import com.Kart.Attendance.Entity.Admin;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final Attendance_Details attendanceRepository;
    private final LeaveRepository leaveRepository;
    private final AdminRepository adminRepository;

    public List<User> getAllUsers() {
        String tenantId = TenantContext.getCurrentTenant();
        if ("SYSTEM_SUPER_ADMIN".equals(tenantId)) {
            return userRepository.findAll();
        }
        return userRepository.findByTenantId(tenantId);
    }

    public User createUser(User user) {
        String tenantId = TenantContext.getCurrentTenant();
        user.setTenantId(tenantId);

        // Auto-generate unique sequential employee code based on organisation short form
        Admin admin = adminRepository.findByTenantId(tenantId).orElse(null);
        List<User> tenantUsers = userRepository.findByTenantId(tenantId);

        // Enforce maximum users limit (excluding ADMIN role)
        if (admin != null && admin.getMaxUsers() != null) {
            long currentEmployeeCount = tenantUsers.stream()
                    .filter(u -> u.getRole() != com.Kart.Attendance.Entity.Type.User_Role.ADMIN)
                    .count();
            if (currentEmployeeCount >= admin.getMaxUsers()) {
                throw new RuntimeException("Maximum user limit of " + admin.getMaxUsers() + " reached for this organization. Please contact Super Admin to upgrade.");
            }
        }

        String prefix = (admin != null && admin.getShortForm() != null && !admin.getShortForm().isBlank())
                ? admin.getShortForm().trim().toUpperCase()
                : "EMP";

        long maxNum = 0;
        for (User u : tenantUsers) {
            String code = u.getEmployeeCode();
            if (code != null && code.startsWith(prefix)) {
                try {
                    String numPart = code.substring(prefix.length());
                    long num = Long.parseLong(numPart);
                    if (num > maxNum) {
                        maxNum = num;
                    }
                } catch (Exception e) {
                    // Ignore malformed or older codes
                }
            }
        }
        long nextNum = maxNum + 1;
        String nextCode = String.format("%s%05d", prefix, nextNum);
        user.setEmployeeCode(nextCode);

        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        String tenantId = TenantContext.getCurrentTenant();
        return userRepository.findById(id).map(user -> {
            if (!tenantId.equals(user.getTenantId())) {
                throw new RuntimeException("User not found for this tenant");
            }

            if (userDetails.getName() != null) user.setName(userDetails.getName());
            if (userDetails.getEmail() != null) user.setEmail(userDetails.getEmail());
            if (userDetails.getPhoneNumber() != null) user.setPhoneNumber(userDetails.getPhoneNumber());
            if (userDetails.getRole() != null) user.setRole(userDetails.getRole());
            if (userDetails.getDepartment() != null) user.setDepartment(userDetails.getDepartment());
            if (userDetails.getDesignation() != null) user.setDesignation(userDetails.getDesignation());
            if (userDetails.getJoiningDate() != null) user.setJoiningDate(userDetails.getJoiningDate());
            if (userDetails.getEmployeeCode() != null) user.setEmployeeCode(userDetails.getEmployeeCode());
            if (userDetails.getGender() != null) user.setGender(userDetails.getGender());
            
            if (userDetails.getPassword() != null && !userDetails.getPassword().isBlank()) {
                user.setPassword(userDetails.getPassword());
            }
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getDashboardDetails(Long userId) {
        String tenantId = TenantContext.getCurrentTenant();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!tenantId.equals(user.getTenantId())) {
            throw new RuntimeException("User not found for this tenant");
        }

        return user;
    }

    @Transactional
    public void deleteUser(Long id) {
        String tenantId = TenantContext.getCurrentTenant();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!tenantId.equals(user.getTenantId())) {
            throw new RuntimeException("User not found for this tenant");
        }

        // Cascade delete associated records
        String userIdStr = String.valueOf(id);
        attendanceRepository.deleteByUserIdAndTenantId(userIdStr, tenantId);
        leaveRepository.deleteByUserIdAndTenantId(userIdStr, tenantId);

        userRepository.delete(user);
    }

    @Transactional
    public java.util.Map<String, Object> bulkCreateUsers(List<User> users) {
        String tenantId = TenantContext.getCurrentTenant();
        Admin admin = adminRepository.findByTenantId(tenantId).orElse(null);
        List<User> tenantUsers = userRepository.findByTenantId(tenantId);

        long currentEmployeeCount = tenantUsers.stream()
                .filter(u -> u.getRole() != com.Kart.Attendance.Entity.Type.User_Role.ADMIN)
                .count();

        int maxAllowed = 100;
        if (admin != null && admin.getMaxUsers() != null) {
            maxAllowed = admin.getMaxUsers();
        }

        long vacancies = Math.max(0, maxAllowed - currentEmployeeCount);

        java.util.List<java.util.Map<String, String>> successEmployees = new java.util.ArrayList<>();
        java.util.List<java.util.Map<String, String>> failedEmployees = new java.util.ArrayList<>();

        int successCount = 0;
        int failedCount = 0;

        for (User user : users) {
            if (user.getName() == null || user.getName().trim().isEmpty()) {
                failedEmployees.add(java.util.Map.of(
                    "name", "Unknown",
                    "email", user.getEmail() != null ? user.getEmail() : "",
                    "error", "Name is required"
                ));
                failedCount++;
                continue;
            }

            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                failedEmployees.add(java.util.Map.of(
                    "name", user.getName(),
                    "email", "",
                    "error", "Email is required"
                ));
                failedCount++;
                continue;
            }

            // Check if email already exists
            if (userRepository.findByEmail(user.getEmail().trim().toLowerCase()).isPresent()) {
                failedEmployees.add(java.util.Map.of(
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "error", "Email is already registered"
                ));
                failedCount++;
                continue;
            }

            // Check limit capacity
            if (successCount >= vacancies) {
                failedEmployees.add(java.util.Map.of(
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "error", "User limit exceeded (maximum capacity of " + maxAllowed + " employees reached)"
                ));
                failedCount++;
                continue;
            }

            // Valid user, generate credentials
            String password = generateRandomPassword();
            user.setPassword(password);
            user.setEmail(user.getEmail().trim().toLowerCase());
            user.setRole(com.Kart.Attendance.Entity.Type.User_Role.EMPLOYEE);
            
            // Create user (to generate employee ID and save)
            User saved = createUser(user);

            successEmployees.add(java.util.Map.of(
                "name", saved.getName(),
                "email", saved.getEmail(),
                "phoneNumber", saved.getPhoneNumber() != null ? saved.getPhoneNumber() : "",
                "department", saved.getDepartment() != null ? saved.getDepartment() : "",
                "designation", saved.getDesignation() != null ? saved.getDesignation() : "",
                "employeeCode", saved.getEmployeeCode() != null ? saved.getEmployeeCode() : "",
                "password", password
            ));
            successCount++;
        }

        return java.util.Map.of(
            "successCount", successCount,
            "failedCount", failedCount,
            "successEmployees", successEmployees,
            "failedEmployees", failedEmployees
        );
    }

    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        java.security.SecureRandom random = new java.security.SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
