package com.Kart.Attendance.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
    private final NoticeSseService noticeSseService;

    public List<User> getAllUsers() {
        String tenantId = TenantContext.getCurrentTenant();
        if ("SYSTEM_SUPER_ADMIN".equals(tenantId)) {
            return userRepository.findAll();
        }
        return userRepository.findByTenantId(tenantId);
    }

    public Page<User> getUsersPage(int page, int size, String search, String department) {
        String tenantId = TenantContext.getCurrentTenant();
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), 100);
        PageRequest pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.ASC, "id"));

        if ("SYSTEM_SUPER_ADMIN".equals(tenantId)) {
            return userRepository.findEmployeesForSuperAdmin(
                    com.Kart.Attendance.Entity.Type.User_Role.ADMIN,
                    normalize(search),
                    normalizeDepartment(department),
                    pageable
            );
        }

        return userRepository.findEmployeesByTenant(
                tenantId,
                com.Kart.Attendance.Entity.Type.User_Role.ADMIN,
                normalize(search),
                normalizeDepartment(department),
                pageable
        );
    }

    public User createUser(User user) {
        String tenantId = TenantContext.getCurrentTenant();
        user.setTenantId(tenantId);

        Admin admin = adminRepository.findByTenantId(tenantId).orElse(null);

        // Enforce maximum users limit (excluding ADMIN role and Inactive users)
        if (admin != null && admin.getMaxUsers() != null) {
            long currentEmployeeCount = getActiveEmployeeCount(tenantId);
            if (currentEmployeeCount >= admin.getMaxUsers()) {
                throw new RuntimeException("Maximum user limit of " + admin.getMaxUsers() + " reached for this organization. Please contact Super Admin to upgrade.");
            }
        }

        String prefix = (admin != null && admin.getShortForm() != null && !admin.getShortForm().isBlank())
                ? admin.getShortForm().trim().toUpperCase()
                : "EMP";

        user.setEmployeeCode(generateEmployeeCode(prefix, findMaxEmployeeNumber(tenantId, prefix) + 1));

        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        String tenantId = TenantContext.getCurrentTenant();
        return userRepository.findById(id).map(user -> {
            if (!tenantId.equals(user.getTenantId())) {
                throw new RuntimeException("User not found for this tenant");
            }

            // Check if status is transitioning from Inactive to Active and enforce limit
            if (userDetails.getStatus() != null && "Active".equalsIgnoreCase(userDetails.getStatus()) && "Inactive".equalsIgnoreCase(user.getStatus())) {
                Admin admin = adminRepository.findByTenantId(tenantId).orElse(null);
                if (admin != null && admin.getMaxUsers() != null) {
                    long currentEmployeeCount = getActiveEmployeeCount(tenantId);
                    if (currentEmployeeCount >= admin.getMaxUsers()) {
                        throw new RuntimeException("Maximum user limit of " + admin.getMaxUsers() + " reached for this organization. Please contact Super Admin to upgrade.");
                    }
                }
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
            if (userDetails.getStatus() != null) {
                user.setStatus(userDetails.getStatus());
                if ("Inactive".equalsIgnoreCase(userDetails.getStatus())) {
                    user.setAuthToken(null);
                    noticeSseService.forceLogoutUser(user.getTenantId(), user.getId());
                }
            }
            
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

        noticeSseService.forceLogoutUser(user.getTenantId(), user.getId());

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

        long currentEmployeeCount = getActiveEmployeeCount(tenantId);

        int maxAllowed = 100;
        if (admin != null && admin.getMaxUsers() != null) {
            maxAllowed = admin.getMaxUsers();
        }

        long vacancies = Math.max(0, maxAllowed - currentEmployeeCount);

        java.util.List<java.util.Map<String, String>> successEmployees = new java.util.ArrayList<>();
        java.util.List<java.util.Map<String, String>> failedEmployees = new java.util.ArrayList<>();
        java.util.List<User> validUsers = new java.util.ArrayList<>();

        int successCount = 0;
        int failedCount = 0;
        String prefix = (admin != null && admin.getShortForm() != null && !admin.getShortForm().isBlank())
                ? admin.getShortForm().trim().toUpperCase()
                : "EMP";
        long nextEmployeeNumber = findMaxEmployeeNumber(tenantId, prefix) + 1;

        Set<String> requestedEmails = users.stream()
                .map(User::getEmail)
                .filter(email -> email != null && !email.trim().isEmpty())
                .map(email -> email.trim().toLowerCase())
                .collect(Collectors.toSet());
        Set<String> existingEmails = requestedEmails.isEmpty()
                ? java.util.Collections.emptySet()
                : userRepository.findByEmailIn(requestedEmails).stream()
                        .map(User::getEmail)
                        .map(email -> email.trim().toLowerCase())
                        .collect(Collectors.toSet());
        Set<String> seenEmails = new java.util.HashSet<>();

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

            String normalizedEmail = user.getEmail().trim().toLowerCase();

            // Check if email already exists
            if (existingEmails.contains(normalizedEmail) || !seenEmails.add(normalizedEmail)) {
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
            user.setEmail(normalizedEmail);
            user.setRole(com.Kart.Attendance.Entity.Type.User_Role.EMPLOYEE);
            user.setTenantId(tenantId);
            user.setEmployeeCode(generateEmployeeCode(prefix, nextEmployeeNumber++));
            validUsers.add(user);

            successEmployees.add(java.util.Map.of(
                "name", user.getName(),
                "email", user.getEmail(),
                "phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "",
                "department", user.getDepartment() != null ? user.getDepartment() : "",
                "designation", user.getDesignation() != null ? user.getDesignation() : "",
                "employeeCode", user.getEmployeeCode() != null ? user.getEmployeeCode() : "",
                "password", password
            ));
            successCount++;
        }

        if (!validUsers.isEmpty()) {
            userRepository.saveAll(validUsers);
        }

        return java.util.Map.of(
            "successCount", successCount,
            "failedCount", failedCount,
            "successEmployees", successEmployees,
            "failedEmployees", failedEmployees
        );
    }

    private long getActiveEmployeeCount(String tenantId) {
        return userRepository.countByTenantIdAndRoleNotAndStatusNotIgnoreCase(
                tenantId,
                com.Kart.Attendance.Entity.Type.User_Role.ADMIN,
                "Inactive"
        );
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeDepartment(String department) {
        String normalized = normalize(department);
        return "All Departments".equalsIgnoreCase(normalized) ? "" : normalized;
    }

    private long findMaxEmployeeNumber(String tenantId, String prefix) {
        return userRepository.findTopByTenantIdAndEmployeeCodeStartingWithOrderByEmployeeCodeDesc(tenantId, prefix)
                .map(User::getEmployeeCode)
                .map(code -> parseEmployeeNumber(code, prefix))
                .orElse(0L);
    }

    private long parseEmployeeNumber(String employeeCode, String prefix) {
        if (employeeCode == null || !employeeCode.startsWith(prefix)) {
            return 0;
        }

        try {
            return Long.parseLong(employeeCode.substring(prefix.length()));
        } catch (Exception e) {
            return 0;
        }
    }

    private String generateEmployeeCode(String prefix, long number) {
        return String.format("%s%05d", prefix, number);
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
